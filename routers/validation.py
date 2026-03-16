import re

def validateDate(date):
    x = re.fullmatch(r"20[0-9]{2}-[0-1][0-9]-[0-3][0-9]", date)
    san_date = x.group() if x != None else ""
    
    if san_date == "":
        return False
    
    if san_date > "2025-12-31" or san_date < "2018-04-08":
        return False

    return san_date

def validateCode(code):
    x = re.fullmatch(r"[0-9]{5}_TL[0-9]+", code)
    san_code = x.group() if x != None else False
    return san_code