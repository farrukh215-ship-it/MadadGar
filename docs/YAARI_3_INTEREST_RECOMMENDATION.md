# Yaari: 3-Interest Minimum Match — Recommendation

## Current behavior
- **Minimum 1 shared interest** required to start chat from Yaari
- Users with 1+ matching interests can chat, add friend, appear in top profiles

## Should we add 3-interest minimum?

### Recommendation: **No (keep 1 minimum)** — for now

**Reasons:**
1. **Network effects** — With 1 minimum, more users can connect. Early-stage apps need growth; stricter limits reduce matches.
2. **User experience** — Many users may have only 1–2 interests filled. Requiring 3 would block a lot of valid chats.
3. **Premium incentive** — Premium users get 10 interests (vs 5 free), so they naturally get more matches. No need to add a separate 3-match rule.
4. **Sorting already helps** — Users with more shared interests are shown first (sorted by `shared_count`). High-match users surface naturally.

### When 3 minimum might make sense
- **Later stage** — When you have enough users that 1-match leads to low-quality or spammy chats.
- **A/B test** — Run 1 vs 3 minimum for a subset of users and compare engagement/quality.
- **Premium-only feature** — e.g. "Premium: Chat with 3+ match only" as a filter, not a hard rule.

### Optional: Add as a filter (not requirement)
- Add a toggle: "Show only 3+ match" — users can choose stricter matching without blocking 1–2 match chats.
