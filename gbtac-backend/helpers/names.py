"""
names.py

Loads a static JSON mapping of sensor codes to human-readable display names
and provides a lookup function used across graph and report endpoints.

Author: Dominique Lee
"""

from pathlib import Path
import json

sensors = {}

path = Path("data/replacement_names.json")
with open(path, "r") as f:
    sensors = json.load(f)

def replace_name(code):
    if(sensors == {}):
        return False
    try:
        return sensors[code]
    except KeyError:
        return False
    