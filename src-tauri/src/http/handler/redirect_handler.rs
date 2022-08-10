use axum::{
  http::{Request, StatusCode},
  response::{Response, Redirect, IntoResponse},
  body::{Body},
  extract::{Path, Query},
};
pub async fn handle(Path(target_url): Path<String>, Query(_params): Query<serde_json::Value>, req: Request<Body>) -> impl IntoResponse {
  if let Some(raw_query) = req.uri().path_and_query() {
    if let Some(target_url_with_query) = raw_query.to_string().strip_prefix("/redirect/") {
      if target_url_with_query.len() > 0 {
        let target_url_with_query = super::final_target_url_with_query(target_url_with_query);
        return Redirect::temporary(&target_url_with_query).into_response()
      }
    }
  }
  let builder = Response::builder().header("TauriProxy", "Redirect Path Not Support").status(StatusCode::BAD_REQUEST);
  builder.body(Body::from(format!("Redirect Path: {} Not Support", target_url))).unwrap().into_response()
}