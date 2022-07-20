#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

fn main() {
  tauri::Builder::default()
    .setup(|_app| {
      // #[cfg(target_os = "macos")]
      // app.set_activation_policy(tauri::ActivationPolicy::Accessory);

      let _listen = std::thread::spawn(move || {
        use device_query::{DeviceEvents, DeviceState, Keycode};
        let device_state = DeviceState::new();
        let _guard = device_state.on_key_down(|key: &Keycode| {
          println!("Keyboard key down: {:#?}", key);
        });
        // let _guard = device_state.on_key_up(|key: &Keycode| {
        //   println!("Keyboard key up: {:#?}", key);
        // });
        loop {}
      });

      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}