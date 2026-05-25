import os

teams = [
  {'name':'Mexico','code':'MEX', 'folder':'MEXICO'},
  {'name':'South Africa','code':'RSA', 'folder':'SOUTH AFRICA'},
  {'name':'South Korea','code':'KOR', 'folder':'KOREA'},
  {'name':'Czech Republic','code':'CZE', 'folder':'REPUBLICA CHECA'},
  {'name':'Canada','code':'CAN', 'folder':'CANADA'},
  {'name':'Bosnia and Herz.','code':'BIH', 'folder':'BOSNIA'},
  {'name':'Qatar','code':'QAT', 'folder':'QATAR'},
  {'name':'Switzerland','code':'SUI', 'folder':'SUIZA'},
  {'name':'Brazil','code':'BRA', 'folder':'BRASIL'},
  {'name':'Morocco','code':'MAR', 'folder':'MARRUECOS'},
  {'name':'Haiti','code':'HAI', 'folder':'HAITI'},
  {'name':'Uzbekistan','code':'UZB', 'folder':'UZBEKISTAN'},
  {'name':'Ecuador','code':'ECU', 'folder':'ECUADOR'},
  {'name':'Austria','code':'AUT', 'folder':'AUSTRIA'},
  {'name':'New Zealand','code':'NZL', 'folder':'NUEVA ZELANDA'},
  {'name':'Cape Verde','code':'CPV', 'folder':'CABO VERDE'},
  {'name':'United States','code':'USA', 'folder':'ESTADOS UNIDOS'},
  {'name':'Algeria','code':'ALG', 'folder':'ARGELIA'},
  {'name':'England','code':'ENG', 'folder':'INGLATERRA'},
  {'name':'Norway','code':'NOR', 'folder':'NORUEGA'},
  {'name':'Argentina','code':'ARG', 'folder':'ARGENTINA'},
  {'name':'Ivory Coast','code':'CIV', 'folder':'COSTA DE MARFIL'},
  {'name':'Croatia','code':'CRO', 'folder':'CROACIA'},
  {'name':'Iran','code':'IRN', 'folder':'IRAN'},
  {'name':'France','code':'FRA', 'folder':'FRANCIA'},
  {'name':'Colombia','code':'COL', 'folder':'COLOMBIA'},
  {'name':'Japan','code':'JPN', 'folder':'JAPON'},
  {'name':'Tunisia','code':'TUN', 'folder':'TUNEZ'},
  {'name':'Spain','code':'ESP', 'folder':'ESPAÑA'},
  {'name':'Senegal','code':'SEN', 'folder':'SENEGAL'},
  {'name':'Scotland','code':'SCO', 'folder':'ESCOCIA'},
  {'name':'Saudi Arabia','code':'KSA', 'folder':'ARABIA SAUDITA'},
  {'name':'Belgium','code':'BEL', 'folder':'BELGICA'},
  {'name':'Egypt','code':'EGY', 'folder':'EGIPTO'},
  {'name':'Uruguay','code':'URU', 'folder':'URUGUAY'},
  {'name':'Jordan','code':'JOR', 'folder':'JORDANIA'},
  {'name':'Germany','code':'GER', 'folder':'ALEMANIA'},
  {'name':'Ghana','code':'GHA', 'folder':'GHANA'},
  {'name':'Turkey','code':'TUR', 'folder':'TURQUIA'},
  {'name':'Panama','code':'PAN', 'folder':'PANAMA'},
  {'name':'Portugal','code':'POR', 'folder':'PORTUGAL'},
  {'name':'Congo DR','code':'COD', 'folder':'RD CONGO'},
  {'name':'Sweden','code':'SWE', 'folder':'SUECIA'},
  {'name':'Curacao','code':'CUW', 'folder':'CURAZAO'},
  {'name':'Netherlands','code':'NED', 'folder':'HOLANDA'},
  {'name':'Paraguay','code':'PAR', 'folder':'PARAGUAY'},
  {'name':'Australia','code':'AUS', 'folder':'AUSTRALIA'},
  {'name':'Iraq','code':'IRQ', 'folder':'IRAK'}
]

base_dir = r'd:\mundial2026\public\figuritas_extraidas'

for t in teams:
    old_path = os.path.join(base_dir, t['folder'])
    new_path = os.path.join(base_dir, t['code'])
    if os.path.exists(old_path):
        os.rename(old_path, new_path)
        print(f"Renamed {t['folder']} to {t['code']}")
    else:
        print(f"Folder {old_path} not found.")
