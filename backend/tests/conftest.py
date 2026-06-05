import os
import sys

# Make backend modules (services, models, ...) importable without env vars.
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
