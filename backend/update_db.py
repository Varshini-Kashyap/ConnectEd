from database import Base, engine
import models

# Create all tables (will add messages table)
Base.metadata.create_all(bind=engine)
print("✅ Database updated with messages table!")
