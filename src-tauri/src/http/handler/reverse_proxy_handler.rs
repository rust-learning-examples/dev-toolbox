use axum::{
  http::{header, Request, StatusCode, HeaderValue, uri::Uri,},
  response::{Response},
  body::{Body},
  extract::{Extension, Path},
};
use hyper::{client::{Client, HttpConnector}};
use hyper_tls::HttpsConnector;

// https://github.com/tokio-rs/axum/blob/main/examples/reverse-proxy/src/main.rs
pub async fn handle(Path(target_url): Path<String>, Extension(client): Extension<Client<HttpsConnector<HttpConnector>, Body>>, mut req: Request<Body>) -> Response<Body> {
  if let Some(raw_query) = req.uri().path_and_query() {
    if let Some(target_url_with_query) = raw_query.to_string().strip_prefix("/reverse_proxy/") {
      if target_url_with_query.len() > 0 {
        let target_uri: Uri = target_url_with_query.parse().unwrap();
        *req.uri_mut() = target_uri.clone();
        // 自定义追加header: HOST, 解决目标接口跨域限制
        req.headers_mut().insert(header::HOST, HeaderValue::from_str(target_uri.host().unwrap()).unwrap());
        return client.request(req).await.unwrap()
      }
    }
  }
  let builder = Response::builder().header("TauriProxy", "Reverse Proxy Path Not Support").status(StatusCode::BAD_REQUEST);
  builder.body(Body::from(format!("Reverse Proxy Path: {} Not Support", target_url))).unwrap()
}