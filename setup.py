import sys
from cx_Freeze import setup, Executable

base = None

setup(name = "Astarael",
      version = "0.0.1",
      description = "Astarael Music Player",
      executables = [Executable("server.py", base=base)])
