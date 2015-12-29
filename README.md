# Koop provider for UNHCR asylum data
This provider parses the data from http://popstats.unhcr.org/en/asylum_seekers_monthly
It needs a postgis table with points for each country and the country names should match the names from UNHCR
The origin and destination are combined into a line and served as geojson and featureserver
