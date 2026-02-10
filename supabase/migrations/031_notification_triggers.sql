-- Create notification when someone rates a post
CREATE OR REPLACE FUNCTION notify_on_rating()
RETURNS TRIGGER AS $$
DECLARE
  v_author_id UUID;
  v_worker_name TEXT;
  v_category_name TEXT;
  v_rater_name TEXT;
BEGIN
  SELECT p.author_id, p.worker_name, c.name INTO v_author_id, v_worker_name, v_category_name
  FROM posts p JOIN categories c ON p.category_id = c.id WHERE p.id = NEW.post_id;
  IF v_author_id = NEW.rater_id THEN RETURN NEW; END IF;
  SELECT display_name INTO v_rater_name FROM profiles WHERE user_id = NEW.rater_id LIMIT 1;
  INSERT INTO notifications (user_id, type, title, body, link)
  VALUES (v_author_id, 'rating', 'New rating', COALESCE(v_rater_name, 'Someone') || ' rated your post', '/post/' || NEW.post_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_rating_notify ON ratings;
CREATE TRIGGER on_rating_notify AFTER INSERT ON ratings FOR EACH ROW EXECUTE FUNCTION notify_on_rating();

-- Create notification when someone comments on a post
CREATE OR REPLACE FUNCTION notify_on_comment()
RETURNS TRIGGER AS $$
DECLARE
  v_author_id UUID;
  v_commenter_name TEXT;
BEGIN
  SELECT author_id INTO v_author_id FROM posts WHERE id = NEW.post_id;
  IF v_author_id = NEW.user_id THEN RETURN NEW; END IF;
  SELECT display_name INTO v_commenter_name FROM profiles WHERE user_id = NEW.user_id LIMIT 1;
  INSERT INTO notifications (user_id, type, title, body, link)
  VALUES (v_author_id, 'comment', 'New comment', COALESCE(v_commenter_name, 'Someone') || ' commented on your post', '/post/' || NEW.post_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_comment_notify ON post_comments;
CREATE TRIGGER on_comment_notify AFTER INSERT ON post_comments FOR EACH ROW EXECUTE FUNCTION notify_on_comment();
