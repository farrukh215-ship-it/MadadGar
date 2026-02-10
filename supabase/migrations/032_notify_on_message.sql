-- Notify recipient when someone sends a message in chat
CREATE OR REPLACE FUNCTION notify_on_message()
RETURNS TRIGGER AS $$
DECLARE
  v_recipient_id UUID;
  v_sender_name TEXT;
  v_preview TEXT;
BEGIN
  -- Don't notify self
  IF NEW.sender_id IS NULL THEN RETURN NEW; END IF;

  -- Get other participant(s) in thread (1-on-1: the other user)
  SELECT p.user_id INTO v_recipient_id
  FROM chat_participants p
  WHERE p.thread_id = NEW.thread_id AND p.user_id != NEW.sender_id
  LIMIT 1;

  IF v_recipient_id IS NULL THEN RETURN NEW; END IF;

  SELECT display_name INTO v_sender_name FROM profiles WHERE user_id = NEW.sender_id LIMIT 1;
  v_preview := LEFT(COALESCE(NEW.content, ''), 50);
  IF LENGTH(COALESCE(NEW.content, '')) > 50 THEN
    v_preview := v_preview || '...';
  END IF;

  INSERT INTO notifications (user_id, type, title, body, link)
  VALUES (v_recipient_id, 'message', 'New message', COALESCE(v_sender_name, 'Someone') || ': ' || COALESCE(NULLIF(v_preview, ''), 'Sent a message'), '/chat/' || NEW.thread_id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_message_notify ON messages;
CREATE TRIGGER on_message_notify AFTER INSERT ON messages FOR EACH ROW EXECUTE FUNCTION notify_on_message();
