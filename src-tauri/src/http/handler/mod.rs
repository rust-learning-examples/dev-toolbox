pub mod redirect_handler;
pub mod reverse_proxy_handler;


pub fn final_target_url_with_query(target_url_with_query: &str) -> String {
  let config = super::CONFIG.lock().unwrap();
  for item in config.rules.iter() {
    let address_rule = &item.address_rule;
    let target_address = &item.target_address;
    // if target_url_with_query.contains(address_rule) {
    //   return target_url_with_query.replace(address_rule, target_address).to_string();
    // }
    let address_rule = regex::Regex::new(address_rule).unwrap();
    if address_rule.is_match(&target_url_with_query) {
      return address_rule.replace_all(&target_url_with_query, target_address).to_string();
    }
  }
  return target_url_with_query.to_string()
}