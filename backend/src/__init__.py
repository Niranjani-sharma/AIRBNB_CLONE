"""StayFinder backend (FastAPI + SQLite).

Layered like a production Node/Express service, adapted to idiomatic FastAPI:

    src/
      routes/        # thin routers: path + deps -> controller
      controllers/   # business logic per resource
      middlewares/   # FastAPI dependencies (auth guards)
      models/        # SQLAlchemy ORM tables (one file per table)
      schemas/       # Pydantic DTOs (camelCase I/O)
      db/            # engine / session / Base
      utils/         # ApiError, ApiResponse, constants, services, security
      app.py         # application factory (CORS, routers, error handlers)
"""
