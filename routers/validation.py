import re

def validateDate(date):
    x = re.fullmatch(r"20[0-9]{2}-[0-1][0-9]-[0-3][0-9]", date)
    sanDate = x.group() if x != None else ""
    
    if sanDate == "":
        return False
    
    if sanDate > "2025-12-31" or sanDate < "2018-04-08":
        return False

    return sanDate

def validateCode(code):
    x = re.fullmatch(r"[0-9]{5}_TL[0-9]+", code)
    sanCode = x.group() if x != None else False
    return sanCode