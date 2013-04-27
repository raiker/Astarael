import sys
from cx_Freeze import setup, Executable

setup(name = "Astarael",
      version = "0.0.1",
      description = "Astarael Music Player",
      options = {"build_exe": {"include_files": ["views", "static"]}},
      executables = [Executable("server.py")])
