# KrishiLink API Contract
Base URL: http://localhost:5000/api/v1
Auth: Authorization: Bearer <supabase_access_token>
Success: { "success": true, "data": ..., "pagination"?: { page, limit, total } }
Error: { "success": false, "message": "...", "errors": {} }

## AUTH
POST /auth/profile            any authed   {role:'farmer'|'buyer', language_preference?, farmer:{farm_name,location,latitude,longitude} | buyer:{institution_name,institution_type,location,latitude,longitude}}
GET  /auth/profile            any authed

## PRODUCTS
GET  /products                public       ?category_id&q

## LISTINGS
POST   /listings              farmer       {product_id, quantity_kg>0, price_per_kg>=0, quality_grade:'A'|'B'|'C', availability_date:'YYYY-MM-DD', delivery_option:'farmer_delivery'|'buyer_pickup', image_urls?[]}
GET    /listings              authed       ?product&min_price&max_price&quality_grade&distance&latitude&longitude&availability_date&mine&page&limit&sort=distance|price|quality|newest
GET    /listings/:id          authed
PATCH  /listings/:id          farmer owner  partial fields (soft-validated)
DELETE /listings/:id          farmer owner  (soft delete -> inactive)

## VOICE
POST /voice/extract-listing   farmer       {transcript | audio_base64, language?} -> draft + missing_fields + requires_confirmation:true (never auto-publishes; 503 if speech provider down)

## DEMANDS
POST  /demands                buyer        {product_id, quantity_kg>0, min_price?, max_price?, required_date, delivery_address, notes?} -> notifies matching farmers
GET   /demands                buyer        ?page&limit
GET   /demands/matches        farmer (no param) or buyer (?demand_id=uuid)
PATCH /demands/:id            buyer owner  partial fields / {status:'open'|'closed'}

## ORDERS (totals computed server-side; transactional; stock cannot go negative)
POST  /orders                 buyer        {items:[{listing_id, quantity_kg}...], delivery_address?}
GET   /orders                 role-scoped  ?status&payment_status&page&limit
PATCH /orders/:id/status      farmer: pending->confirmed|rejected, confirmed->dispatched
                              buyer:  dispatched->delivered, pending->cancelled
                              admin:  all valid transitions; invalid transitions -> 409

## BULK DEALS
POST  /bulk-deals             farmer       {product_id, quantity_kg, min_quantity_kg>=50, base_price, closes_at}
GET   /bulk-deals             authed       ?mine&product_id&page&limit (only open & unexpired listed publicly)
POST  /bulk-deals/:id/offers  buyer        {offered_quantity>=min, offered_price, delivery_date?} -> smart_score + score_reasons computed server-side
PATCH /bulk-offers/:id        farmer(deal owner): {action:'accept'|'reject'}   buyer(offer owner): {action:'withdraw'}

## RATINGS
POST /ratings                 farmer|buyer {order_id, rating:1..5, comment?} - only after delivered, one per order per rater, only between the two parties

## DASHBOARDS
GET /dashboard/farmer         farmer       stats + opportunities
GET /dashboard/buyer          buyer        stats

## ADMIN (all logged to audit_logs)
GET   /admin/analytics
GET   /admin/users            ?page&limit
PATCH /admin/users/:id/verify {verified:bool}
GET   /admin/listings         ?status&page&limit
PATCH /admin/listings/:id/status {status:'active'|'inactive'|'expired'}
GET   /admin/orders           ?page&limit
GET   /admin/disputes         ?page&limit
PATCH /admin/disputes/:id/resolve {resolution, status?'resolved'|'rejected'}

## DISPUTES
POST /disputes               farmer|buyer (own order) {order_id, reason}

## NOTIFICATIONS
GET   /notifications          authed       ?is_read&page&limit
PATCH /notifications/:id/read authed (own)
POST  /notifications/read-all authed

## HTTP codes
200 OK | 201 Created | 400 Bad Request | 401 Unauthenticated | 403 Forbidden | 404 Not Found | 409 Conflict | 422 Validation | 500 Server Error

