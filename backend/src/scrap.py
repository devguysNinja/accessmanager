reader_data = {
    "grant_type": "ACCESS_GRANTED",
    "uid": 123,
}

data_keys = [key for key in reader_data.keys()]

print(data_keys)


from datetime import datetime, timedelta

today = datetime.now().date()
start_of_month = today.replace(day=1)
print("Start of the Month: ", start_of_month)

start_of_week = today - timedelta(days=today.weekday())
end_of_week = start_of_week + timedelta(days=6)

print("Start of the Week: ", start_of_week)
print("End of the Week: ", end_of_week)



# +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

new_array = []
payload = {
	"start_date": "2024-03-03", 
	"group": "g1",
	"shifts": {
		"Sunday": "morning",
		"Monday": "morning",
		"Tuesday": "",
		"Wednesday": "",
		"Thursday": "night",
		"Friday": "night",
		"Saturday": "afternoon"
	}
	}
new_dict = {}
for k,v in payload.items():
	new_dict.update("batch":v) if k == "group"
	new_dict.update("start_date":v) if k == "start_date"
	break

for k,v in payload['shifts'].items():
	new_dict.update("shift":v, "work_day":k)
	new_array.append(new_dict)




[
    {
        "start_date": "2024-03-03", 
        "group": "g1",
        "shifts": {
            "Sunday": "morning",
            "Monday": "morning",
            "Tuesday": "",
            "Wednesday": "",
            "Thursday": "night",
            "Friday": "night",
            "Saturday": "afternoon"
        }
    },
        {
        "start_date": "2024-03-03", 
        "group": "g2",
        "shifts": {
            "Sunday": "night",
            "Monday": "night",
            "Tuesday": "",
            "Wednesday": "",
            "Thursday": "afternoon",
            "Friday": "afternoon",
            "Saturday": "night"
        }
    },
        {
            "start_date": "2024-03-03", 
            "group": "g3",
            "shifts": {
                "Sunday": "afternoon",
                "Monday": "",
                "Tuesday": "afternoon",
                "Wednesday": "",
                "Thursday": "night",
                "Friday": "night",
                "Saturday": "morning"
            }
    }

]

shift_date = ""
start_date = '2024-03-09T23:00:00.000Z'
if work_day == 'sunday':
    delta = 0
    shift_date = start_date + delta
elif work_day == 'monday':
    delta = 1
    shift_date = start_date + delta
elif work_day == 'tuesday':
    delta = 3
    shift_date = start_date + delta
elif work_day == 'wednesday':
    delta = 3
    shift_date = start_date + delta
elif work_day == 'thursday':
    delta = 3
    shift_date = start_date + delta
elif work_day == 'friday':
    delta = 3
    shift_date = start_date + delta
elif work_day == 'saturday':
    delta = 3
    shift_date = start_date + delta