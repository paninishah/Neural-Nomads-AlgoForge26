from app.core.security import get_password_hash, verify_password

p1 = "admin123"
p2 = "password123"
h1 = get_password_hash(p1)
h2 = get_password_hash(p2)
print(f"admin123: {h1}")
print(f"password123: {h2}")

db_hash = "$2b$12$WsRuh2vQLnGBlBQa.x8KSuNR.wkGcrEYojWGLycTtVhWEN3rw9VWe"
print(f"DB Hash matches admin123? {verify_password(p1, db_hash)}")
print(f"DB Hash matches password123? {verify_password(p2, db_hash)}")
