use tauri_plugin_opener::OpenerExt;
use lumi_core::{Services,Db};
use serde_json::Value;
use tauri::{Manager, WebviewUrl, WebviewWindowBuilder};

#[tauri::command]
fn open_lumi_window(app: tauri::AppHandle, module: String) -> Result<(), String> {
    let modules = ["brief", "career", "health", "crm", "academic", "settings", "widget"];
    if !modules.contains(&module.as_str()) { return Err("Module inconnu".into()); }
    let label = if module == "brief" { "main".to_owned() } else { format!("lumi-{}", module) };
    if let Some(window) = app.get_webview_window(&label) {
        window.unminimize().map_err(|e| e.to_string())?;
        window.show().map_err(|e| e.to_string())?;
        return window.set_focus().map_err(|e| e.to_string());
    }
    let widget = module == "widget";
    let path = if widget { "widget/".to_owned() } else { format!("/?module={}", module) };
    let builder = WebviewWindowBuilder::new(&app, label, WebviewUrl::App(path.into()))
        .title(if widget { "Lumi · Widget" } else { "Lumi" })
        .inner_size(if widget { 380.0 } else { 1280.0 }, if widget { 480.0 } else { 850.0 })
        .min_inner_size(if widget { 350.0 } else { 960.0 }, if widget { 450.0 } else { 640.0 })
        .decorations(false).transparent(widget).always_on_top(widget).resizable(!widget);
    builder.build().map(|_| ()).map_err(|e| e.to_string())
}


#[tauri::command]
fn local_get(state:tauri::State<'_,Services>,key:String)->Result<Value,String>{state.db.get(&key)}
#[tauri::command]
fn local_list(state:tauri::State<'_,Services>,prefix:String)->Result<Value,String>{state.db.list(&prefix)}
#[tauri::command]
fn local_batch(state:tauri::State<'_,Services>,writes:Value)->Result<(),String>{state.db.batch(&writes)}
#[tauri::command]
fn service_status(state:tauri::State<'_,Services>)->Result<Value,String>{state.status()}
#[tauri::command]
async fn service_configure(state:tauri::State<'_,Services>,settings:Value)->Result<Value,String>{state.configure(settings).await}
#[tauri::command]
async fn offer_read(state:tauri::State<'_,Services>,url:String)->Result<String,String>{state.read_offer(&url).await}
#[tauri::command]
async fn gemini_generate(state:tauri::State<'_,Services>,body:Value)->Result<Value,String>{state.generate(body).await}
#[tauri::command]
async fn provider_get(state:tauri::State<'_,Services>,provider:String,url:String)->Result<Value,String>{state.get(&provider,&url).await}
#[tauri::command]
async fn provider_connect(app:tauri::AppHandle,state:tauri::State<'_,Services>,provider:String)->Result<Value,String>{state.connect(&provider,move |url|app.opener().open_url(url,None::<&str>).map_err(|_|"Impossible d’ouvrir le navigateur".to_string())).await}
#[tauri::command]
fn provider_cancel(state:tauri::State<'_,Services>){state.cancel()}
#[tauri::command]
async fn provider_disconnect(state:tauri::State<'_,Services>,provider:String)->Result<Value,String>{state.disconnect(&provider).await}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .setup(|app|{let path=app.path().app_data_dir()?;std::fs::create_dir_all(&path)?;let db=Db::open(&path.join("lumi.sqlite3")).map_err(std::io::Error::other)?;app.manage(Services::new(db));Ok(())})
        .invoke_handler(tauri::generate_handler![open_lumi_window,local_get,local_list,local_batch,service_status,service_configure,offer_read,gemini_generate,provider_get,provider_connect,provider_cancel,provider_disconnect])
        .run(tauri::generate_context!())
        .expect("Impossible de démarrer Lumi");
}
