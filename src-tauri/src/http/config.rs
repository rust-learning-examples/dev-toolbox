use std::pin::Pin;

pub struct Config {
  pub port: u16,
  // |target_url: String| -> final_url: String,
  pub url_handler: Pin<Box<dyn Fn(String) -> String + Send + Sync>>,
}

impl Default for Config {
  fn default() -> Self {
    Self {
      port: 3099,
      url_handler: Box::pin(|target_url| target_url)
    }
  }
}
