use device_query::{DeviceEvents, DeviceState, Keycode};
use once_cell::sync::Lazy;
use std::sync::{Mutex, Arc};

pub struct KeyboardEventsHandler {
allow_record: bool,
is_shift: bool,
input_text: String,
}

impl Default for KeyboardEventsHandler {
  fn default() -> Self {
    Self {
      allow_record: false,
      is_shift: false,
      input_text: "".into(),
    }
  }
 }

static KEYBOARD_EVENTS_HANDLER: Lazy<Arc<Mutex<KeyboardEventsHandler>>> = Lazy::new(|| {
  Arc::new(Mutex::new(KeyboardEventsHandler::default()))
});

enum RegexWord {
  Text(String),
  ShiftText(String),
  Tab,
  Delete,
  Ignore,
}

pub fn watch<E>(executor: E) where E: Fn(String) -> () + Send + Sync + 'static {
  let device_state = DeviceState::new();
  let get_record_word = |key: String| {
    let key = regex::Regex::new(r"^Key").unwrap().replace(&key, "").to_string();
    if regex::Regex::new(r"^[A-Z]{1}$").unwrap().is_match(&key) {
      return RegexWord::Text(key.to_lowercase())
    } else if regex::Regex::new(r"^Space$").unwrap().is_match(&key) {
      return RegexWord::Text(" ".to_string())
    } else if regex::Regex::new(r"^[0-9\-=]{1}$").unwrap().is_match(&key) {
      return RegexWord::ShiftText(key.to_lowercase())
    } else if regex::Regex::new(r"^Minus$").unwrap().is_match(&key) {
      return RegexWord::ShiftText("-".to_string())
    } else if regex::Regex::new(r"^Equal$").unwrap().is_match(&key) {
      return RegexWord::ShiftText("=".to_string())
    } else if regex::Regex::new(r"^LeftBracket$").unwrap().is_match(&key) {
      return RegexWord::ShiftText("[".to_string())
    } else if regex::Regex::new(r"^RightBracket$").unwrap().is_match(&key) {
      return RegexWord::ShiftText("]".to_string())
    } else if regex::Regex::new(r"^BackSlash$").unwrap().is_match(&key) {
      return RegexWord::ShiftText("\\".to_string())
    } else if regex::Regex::new(r"^Slash$").unwrap().is_match(&key) {
      return RegexWord::ShiftText("/".to_string())
    } else if regex::Regex::new(r"^Semicolon$").unwrap().is_match(&key) {
      return RegexWord::ShiftText(";".to_string())
    } else if regex::Regex::new(r"^Apostrophe$").unwrap().is_match(&key) {
      return RegexWord::ShiftText("'".to_string())
    } else if regex::Regex::new(r"^Comma$").unwrap().is_match(&key) {
      return RegexWord::ShiftText(",".to_string())
    } else if regex::Regex::new(r"^Dot$").unwrap().is_match(&key) {
      return RegexWord::ShiftText(".".to_string())
    }  else if regex::Regex::new(r"^Grave$").unwrap().is_match(&key) {
      return RegexWord::ShiftText("·".to_string())
    } else if regex::Regex::new(r"^Tab$").unwrap().is_match(&key) {
      return RegexWord::Tab
    } else if regex::Regex::new(r"^Backspace$").unwrap().is_match(&key) {
      return RegexWord::Delete
    }
    RegexWord::Ignore
  };
  let _guard = device_state.on_key_down(move |key: &Keycode| {
    let key = key.to_string();
    // println!("in-- key: {}", key);
    if regex::Regex::new(r"Shift$").unwrap().is_match(&key) {
      let mut global_keyboard_events_handler = KEYBOARD_EVENTS_HANDLER.lock().unwrap();
      global_keyboard_events_handler.is_shift = true;
    } else {
      let record_word = get_record_word(key);

      match &record_word {
        RegexWord::ShiftText(key) => {
          let mut global_keyboard_events_handler = KEYBOARD_EVENTS_HANDLER.lock().unwrap();
          if global_keyboard_events_handler.is_shift {
            match key.as_str() {
              "·" => {
                global_keyboard_events_handler.input_text = "".to_string();
                global_keyboard_events_handler.allow_record = true;
              },
              "/" => {
                if global_keyboard_events_handler.allow_record && global_keyboard_events_handler.input_text.len() > 0 {
                  executor(global_keyboard_events_handler.input_text.clone());
                }
                global_keyboard_events_handler.input_text = "".to_string();
                global_keyboard_events_handler.allow_record = false;
              },
              _ => ()
            }
          }
        },
        _ => ()
      }

      let mut global_keyboard_events_handler = KEYBOARD_EVENTS_HANDLER.lock().unwrap();
      if global_keyboard_events_handler.allow_record {
        match &record_word {
          RegexWord::Text(key) => {
            global_keyboard_events_handler.input_text.push_str(&key);
          },
          RegexWord::ShiftText(key) => {
            if global_keyboard_events_handler.is_shift {
              match key.as_str() {
                "1" => global_keyboard_events_handler.input_text.push_str("!"),
                "2" => global_keyboard_events_handler.input_text.push_str("@"),
                "3" => global_keyboard_events_handler.input_text.push_str("#"),
                "4" => global_keyboard_events_handler.input_text.push_str("$"),
                "5" => global_keyboard_events_handler.input_text.push_str("%"),
                "6" => global_keyboard_events_handler.input_text.push_str("^"),
                "7" => global_keyboard_events_handler.input_text.push_str("&"),
                "8" => global_keyboard_events_handler.input_text.push_str("*"),
                "9" => global_keyboard_events_handler.input_text.push_str("("),
                "0" => global_keyboard_events_handler.input_text.push_str(")"),
                // "·" => (*input_text).push_str("~"), // start
                "-" => global_keyboard_events_handler.input_text.push_str("_"),
                "=" => global_keyboard_events_handler.input_text.push_str("+"),
                "[" => global_keyboard_events_handler.input_text.push_str("{"),
                "]" => global_keyboard_events_handler.input_text.push_str("}"),
                "\\" => global_keyboard_events_handler.input_text.push_str("|"),
                ";" => global_keyboard_events_handler.input_text.push_str(":"),
                "'" => global_keyboard_events_handler.input_text.push_str("\""),
                "," => global_keyboard_events_handler.input_text.push_str("<"),
                "." => global_keyboard_events_handler.input_text.push_str(">"),
                // "/" => (*input_text).push_str("?"), // end
                _ => ()
              }
            } else {
              global_keyboard_events_handler.input_text.push_str(&key);
            }
          },
          RegexWord::Tab => {},
          RegexWord::Delete => {
            global_keyboard_events_handler.input_text.pop();
          },
          _ => {}
        }
      }
    }
    // {
    //   println!("Keyboard key down: {:#?}, inputText: {}", key, KEYBOARD_EVENTS_HANDLER.input_text.lock().unwrap());
    // }
  });
  let _guard = device_state.on_key_up(|key: &Keycode| {
    let key = key.to_string();
    // println!("out-- key: {}", key);
    if regex::Regex::new(r"Shift$").unwrap().is_match(&key) {
      let mut global_keyboard_events_handler = KEYBOARD_EVENTS_HANDLER.lock().unwrap();
      global_keyboard_events_handler.is_shift = false;
    }
  });
  // loop {}
  std::thread::park();
}

pub fn handle_user_input(input_text: String, _replace_content: String) -> Result<(), &'static str> {
  // use enigo::{Enigo, Key, KeyboardControllable};
  // let mut enigo = Enigo::new();
  // for _i in 0..(input_text.len() + 2) {
  //   // enigo.key_down(Key::Backspace);
  //   // enigo.key_up(Key::Backspace);
  //   enigo.key_click(Key::Backspace);
  //   // std::thread::sleep(Duration::from_millis(20));
  // }
  // enigo.key_sequence(&replace_content);

  use rdev::{simulate, EventType, Key, SimulateError};
  let send = |event_type: &EventType| {
    let delay = std::time::Duration::from_millis(20);
    match simulate(event_type) {
      Ok(()) => (),
      Err(SimulateError) => {
          println!("We could not send {:?}", event_type);
      }
    }
    // Let ths OS catchup (at least MacOS)
    std::thread::sleep(delay);
  };

  for _i in 0..(input_text.len() + 2) {
    send(&EventType::KeyPress(Key::Backspace));
    send(&EventType::KeyRelease(Key::Backspace));
  }

  if cfg!(target_os = "macos") {
    send(&EventType::KeyPress(Key::MetaLeft));
    send(&EventType::KeyPress(Key::KeyV));
    send(&EventType::KeyRelease(Key::KeyV));
    send(&EventType::KeyRelease(Key::MetaLeft));
  } else {
    send(&EventType::KeyPress(Key::ControlLeft));
    send(&EventType::KeyPress(Key::KeyV));
    send(&EventType::KeyRelease(Key::KeyV));
    send(&EventType::KeyRelease(Key::ControlLeft));
  }

  Ok(())
}