use crate::{Result,err};
use rusqlite::{Connection,OptionalExtension,params};
use serde_json::{Value,json};
use std::{path::Path,sync::Mutex};
pub struct Db(Mutex<Connection>);
fn read(c:&Connection,key:&str)->Result<Value>{let text:Option<String>=c.query_row("SELECT value FROM kv WHERE key=?1",[key],|r|r.get(0)).optional().map_err(err)?;text.map(|s|serde_json::from_str(&s).map_err(err)).transpose().map(|v|v.unwrap_or(Value::Null))}
impl Db {
 pub fn open(path:&Path)->Result<Self>{let c=Connection::open(path).map_err(err)?;c.busy_timeout(std::time::Duration::from_secs(5)).map_err(err)?;c.execute_batch("PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS kv(key TEXT PRIMARY KEY,value TEXT NOT NULL);").map_err(err)?;Ok(Self(Mutex::new(c)))}
 pub fn get(&self,key:&str)->Result<Value>{let c=self.0.lock().map_err(err)?;read(&c,key)}
 pub fn list(&self,prefix:&str)->Result<Value>{let c=self.0.lock().map_err(err)?;let mut q=c.prepare("SELECT key,value FROM kv WHERE substr(key,1,length(?1))=?1 ORDER BY key").map_err(err)?;let pairs=q.query_map([prefix],|r|Ok((r.get::<_,String>(0)?,r.get::<_,String>(1)?))).map_err(err)?;let mut out=Vec::new();for row in pairs{let(k,v)=row.map_err(err)?;out.push(json!({"key":k,"value":serde_json::from_str::<Value>(&v).map_err(err)?}));}Ok(json!(out))}
 pub fn batch(&self,writes:&Value)->Result<()> {let writes=writes.as_array().ok_or("Liste d’enregistrements invalide")?;if writes.len()>100_000{return Err("Trop d’enregistrements".into())}let mut c=self.0.lock().map_err(err)?;let tx=c.transaction().map_err(err)?;for w in writes{let k=w["key"].as_str().ok_or("Clé manquante")?;if k.len()>1500||!w.is_object()||w.get("value").is_none(){return Err("Enregistrement invalide".into())}if let Some(expected)=w.get("expected"){if &read(&tx,k)?!=expected{return Err("CONFLICT: Ces données ont changé dans une autre fenêtre. Réessayez.".into())}}let v=w["value"].to_string();if v.len()>72*1024*1024{return Err("Fichier trop volumineux".into())}tx.execute("INSERT INTO kv(key,value) VALUES(?1,?2) ON CONFLICT(key) DO UPDATE SET value=excluded.value",params![k,v]).map_err(err)?;}tx.commit().map_err(err)?;Ok(())}
}
#[cfg(test)]mod tests{use super::*;
#[test]fn batch_is_atomic_and_detects_stale_edits(){let d=Db::open(Path::new(":memory:")).unwrap();d.batch(&json!([{"key":"rows/a","value":{"v":1}}])).unwrap();assert!(d.batch(&json!([{"key":"rows/b","value":2},{"key":"rows/a","value":3,"expected":null}])).is_err());assert_eq!(d.get("rows/a").unwrap(),json!({"v":1}));assert_eq!(d.get("rows/b").unwrap(),Value::Null);d.batch(&json!([{"key":"rows/a","value":2,"expected":{"v":1}}])).unwrap();assert_eq!(d.get("rows/a").unwrap(),2);}
#[test]fn prefixes_are_literal_not_sql_patterns(){let d=Db::open(Path::new(":memory:")).unwrap();d.batch(&json!([{"key":"config/secret","value":"excluded"},{"key":"rows/a","value":"data"}])).unwrap();assert_eq!(d.list("rows/").unwrap().as_array().unwrap().len(),1);assert_eq!(d.list("%").unwrap(),json!([]));}
}
