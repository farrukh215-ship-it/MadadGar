-- Respect notification_preferences when inserting notifications
-- Messages: check messages preference
CREATE OR REPLACE FUNCTION notify_on_message()
RETURNS TRIGGER AS $$
DECLARE
  v_recipient_id UUID;
  v_sender_name TEXT;
  v_preview TEXT;
  v_messages_on BOOLEAN;
BEGIN
  IF NEW.sender_id IS NULL THEN RETURN NEW; END IF;

  SELECT p.user_id INTO v_recipient_id
  FROM chat_participants p
  WHERE p.thread_id = NEW.thread_id AND p.user_id != NEW.sender_id
  LIMIT 1;

  IF v_recipient_id IS NULL THEN RETURN NEW; END IF;

  SELECT COALESCE(np.messages, TRUE) INTO v_messages_on
  FROM notification_preferences np
  WHERE np.user_id = v_recipient_id;
  IF v_messages_on = FALSE THEN RETURN NEW; END IF;

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

-- Recommendations (ratings): check recommendations preference
CREATE OR REPLACE FUNCTION notify_on_rating()
RETURNS TRIGGER AS $$
DECLARE
  v_author_id UUID;
  v_worker_name TEXT;
  v_category_name TEXT;
  v_rater_name TEXT;
  v_recs_on BOOLEAN;
BEGIN
  SELECT p.author_id, p.worker_name, c.name INTO v_author_id, v_worker_name, v_category_name
  FROM posts p JOIN categories c ON p.category_id = c.id WHERE p.id = NEW.post_id;
  IF v_author_id = NEW.rater_id THEN RETURN NEW; END IF;

  SELECT COALESCE(np.recommendations, TRUE) INTO v_recs_on
  FROM notification_preferences np
  WHERE np.user_id = v_author_id;
  IF v_recs_on = FALSE THEN RETURN NEW; END IF;

  SELECT display_name INTO v_rater_name FROM profiles WHERE user_id = NEW.rater_id LIMIT 1;
  INSERT INTO notifications (user_id, type, title, body, link)
  VALUES (v_author_id, 'rating', 'New rating', COALESCE(v_rater_name, 'Someone') || ' rated your post', '/post/' || NEW.post_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
