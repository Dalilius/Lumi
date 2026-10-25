pub mod db;
pub mod services;
pub use db::Db;
pub use services::Services;
pub type Result<T> = std::result::Result<T,String>;
pub fn err<E:std::fmt::Display>(e:E)->String{e.to_string()}
