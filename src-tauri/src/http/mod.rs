pub mod handler;
pub mod config;
use std::net::SocketAddr;
use axum::{routing, Router};

use once_cell::sync::Lazy;
use std::sync::{Mutex, Arc};

pub static CONFIG: Lazy<Arc<Mutex<config::Config>>> = Lazy::new(|| {
  Arc::new(Mutex::new(config::Config::default()))
});

pub async fn listen(port: u16) -> Result<(), &'static str> {

  let addr = SocketAddr::from(([127, 0, 0, 1], port));

  // let clinet = Client::new(); // only support http
  let https = hyper_tls::HttpsConnector::new();
  let client = hyper::client::Client::builder().build::<_, hyper::Body>(https);

  let router = Router::new()
    .route("/", routing::get(|| async { "Hello, World!" }))
    .route("/redirect/*__target_url__", routing::any(handler::redirect_handler::handle))
    .route("/reverse_proxy/*__target_url__", routing::any(handler::reverse_proxy_handler::handle))
    .layer(
      // see https://docs.rs/tower-http/latest/tower_http/cors/index.html
      // 自定义跨域信息
      // tower_http::cors::CorsLayer::new()
      //   .allow_methods(cors::Any)
      //   // .allow_origin(cors::Any) // https://docs.rs/tower-http/0.3.4/tower_http/cors/struct.CorsLayer.html#method.allow_origin
      //   .allow_origin(cors::Origin::predicate(|_origin: &HeaderValue, _request_head: &axum::http::request::Parts| true))
      //   .allow_headers(vec![header::HeaderName::from_bytes(b"*").unwrap()])
      //   .expose_headers(cors::Any)
      //   .allow_credentials(false)
      // 全量支持跨域信息 https://docs.rs/tower-http/latest/tower_http/cors/struct.CorsLayer.html#method.very_permissive
      tower_http::cors::CorsLayer::very_permissive()
    )
    .layer(axum::extract::Extension(client));

  match axum::Server::bind(&addr)
  .http1_preserve_header_case(true)
  .http1_title_case_headers(true)
  .serve(router.into_make_service()).await {
    Ok(_) => Ok(()),
    _ => Err("Failed to start service")
  }
}