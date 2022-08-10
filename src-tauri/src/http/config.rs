use serde::{Serialize, Deserialize};
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConfigRule {
  pub address_rule: String,
  pub target_address: String,
}

pub struct Config {
  pub port: u16,
  pub rules: Vec<ConfigRule>,
}

impl Default for Config {
  fn default() -> Self {
    Self {
      port: 3099,
      rules: vec![],
    }
  }
}
