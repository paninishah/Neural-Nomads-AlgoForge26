import re
import logging

def mock_extract_name(lines):
    BLACKLIST = {
        "GOVERNMENT OF INDIA", "UNIQUE IDENTIFICATION", "AUTHORITY", "INDIA",
        "MALE", "FEMALE", "TRANSGENDER", "DOB", "YEAR", "FATHER", "NAME",
        "ENUMERATION", "ADDRESS", "INCOME TAX", "DEPARTMENT", "RATION CARD"
    }
    
    candidates = []
    for line in lines:
        clean_line = line.strip()
        if re.match(r"^[A-Za-z]+(\s[A-Za-z]+)+$", clean_line):
            words = set(clean_line.upper().split())
            if words.isdisjoint(BLACKLIST):
                candidates.append(clean_line)
    
    return candidates[0] if candidates else "Extracted Name"

# Test Cases
test_1 = ["GOVERNMENT OF INDIA", "MALE", "Panini Nirav Shah", "9999 1111 2222"]
test_2 = ["UNIQUE IDENTIFICATION AUTHORITY OF INDIA", "Mahek Sanghvi", "DOB: 01/01/1990"]

print(f"Test 1 (Panini): {mock_extract_name(test_1)}")
print(f"Test 2 (Mahek): {mock_extract_name(test_2)}")

assert mock_extract_name(test_1) == "Panini Nirav Shah"
assert mock_extract_name(test_2) == "Mahek Sanghvi"
print("Verification SUCCESS: No hardcoding, real-time filtering works.")
