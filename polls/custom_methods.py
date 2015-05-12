"""
contains methods that are used in views.py for asynchronous AJAX views.
These methods are defined in this file so as not to put methods that
represent a view and those that do not all in views.py.
"""

from polls.models import *
from datetime import *
from geopy.distance import vincenty

# calculate age from a datetime object, born, specifying when user was born
def calculate_age(born):
    today = date.today()
    return today.year - born.year - ((today.month, today.day) < (born.month, born.day))

"""
The following data is an examle of the format in which this method 
formats an answer_set (data is arbitrary in this example).
{"answers":
    [
        {
            "answer": "casey",
            "frequency": 34,
            "maleFrequency": 10,
            "femaleFrequency": 24,
            "ageFreqs": [10, 2, 3, 1, 5, 0, 9, 4]
        },
        {
            "answer": "lachie",
            "frequency": 65,
            "maleFrequency": 16,
            "femaleFrequency": 49,
            "ageFreqs": [8, 10, 8, 3, 7, 12, 5, 11]
        },
        ...
    ]
"""
def formatAnswers(answer_set):
    array = []
    for a in answer_set:
        obj = {}
        obj['answer'] = a.text
        obj['frequency'] = a.users.count()
        # find formatted data ---
        maleCount = 0
        femaleCount = 0
        ageArray = [0,0,0,0,0,0,0]
        for user in a.users.all():
            if user.gender == 'male':
                maleCount += 1
            if user.gender == 'female':
                femaleCount += 1
            age = calculate_age(user.birthday)
            # ['Under 14'], ['15-17'], ['18-21'], ['22-29'], ['30-39'], ['40-49'], ['Over 50'])
            if age <= 14:
                ind = 0
            elif age <= 17:
                ind = 1
            elif age <= 21:
                ind = 2
            elif age <= 29:
                ind = 3
            elif age <= 39:
                ind = 4
            elif age <= 49:
                ind = 5
            else:
                ind = 6
            ageArray[ind] += 1
        # -----------------------
        obj['maleFrequency'] = maleCount
        obj['femaleFrequency'] = femaleCount
        obj['ageFreqs'] = ageArray
        array.append(obj)
    return array

"""
sort array of questions, first by method specified in sub_query, 
then by the complimentary method ('popular' or 'recent'). rec_dir
specifies the direction of the recent sorting, and pop_dir specifies
the direction of the popular sorting ('asc' or 'desc')
"""
# ---------------------------------------------------------------------
def sortByQuery(questions, sub_query, pop_dir, rec_dir):
    if sub_query == 'recent':
        questions = sortByPopular(questions, pop_dir)
        questions = sortByRecent(questions, rec_dir)
    elif sub_query == 'popular':
        questions = sortByRecent(questions, rec_dir)
        questions = sortByPopular(questions, pop_dir)
    return questions

# sort array of questions by most popular
def sortByPopular(questions, pop_dir):
    # popular is most answered
    def mostPopular(question):
        # count answers associated with each answer
        xcount = 0
        for answer in question.answer_set.all():
            xcount += answer.users.count()
        return xcount

    questions = sorted(questions, key=mostPopular)
    if pop_dir == 'desc':
        questions = list(reversed(questions))
    return questions

# sort array of questions by most recent
def sortByRecent(questions, rec_dir):
    questions = sorted(questions, key=lambda question: question.pub_date)
    if rec_dir == 'desc':
        questions = list(reversed(questions))
    return questions

# ---------------------------------------------------------------------

# function used in ajax views to return the next questions relevant
# to user, returned in sets of 'returncount'.
def getQuestions(user_pk, ran):
    questions = []
    returncount = 10
    try:
        user = User.objects.get(pk=user_pk)
    except:
        return questions

    lat = user.lat
    lon = user.lon
    radius = 5 

    qs = Question.objects.all()
    if ran == "near":
        for q in qs:
            # exclude all questions outside five km radius
            # vincenty is an external method from geo.py
            if vincenty((lon,lat),(q.lon,q.lat)).miles > radius:
                qs = qs.exclude(pk=q.pk)
    elif ran == "far":
        for q in qs:
            # exclude all questions inside five mile radius
            if vincenty((lon,lat),(q.lon,q.lat)).miles < radius:
                qs = qs.exclude(pk=q.pk)
    # exclude already answered (or flagged) questions
    for each in user.answer_set.all():
        qs = qs.exclude(pk=each.question.pk) 
    for q in user.question_flagged.all():
        qs = qs.exclude(pk=q.pk)

    for q in qs:
        # question must have at least five flags
        # if more than 1/7th of users have flagged, don't show to anyone
        usercount = 0
        for answer in q.answer_set.all():
            usercount += answer.users.count()
        if (q.flags.count() >= 5) and (q.flags.count() >= usercount/7):
            qs.exclude(pk=q.pk)

    qs = sortByRecent(qs, 'desc') #custom method
    qs = qs[0:returncount]

    return qs