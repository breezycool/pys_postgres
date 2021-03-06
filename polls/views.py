"""
Name: views.py
Author: PYS team
Contents:
the different views throgh which the user may interact with the site. 
Info:
The site is hosted from a single page view, static_index.html. This
view contains Javascript code that uses asychronous AJAX requests to 
communicate with the backend as the user interacts with the the site.
These AJAX views send and receive data as JSON strings. Each AJAX method
is documented in a function comment before the function itself.
"""

from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import get_object_or_404, render
from django.views.decorators.csrf import csrf_exempt

import json
from datetime import *

from polls.models import *
from custom_methods import *

# ------------------------ page views ---------------------------------
def index(request):
    return render(request, 'polls/static_index.html')

# ---------------------- ajax site views ------------------------------
"""
get_questions receives user_pk and a type ('near' or 'far') from 
Javascript, and returns a set of questions that are relevant to that 
user and type in the following JSON format ('*' represents variable 
data):
{*question.pk*:
    {
        'question': *question.question_text*, 
        'answers': [[*answer.pk*, *answer.text*],[*answer.pk*, *answer.text*],...],
        'lat': *question.lat*,
        'lon': *question.lon*
    }
}
"""
@csrf_exempt
def get_questions(request):
    if request.method == 'POST':
        user_pk = int(request.POST.get('user_pk'))
        ran = request.POST.get('type')
        questions = getQuestions(user_pk, ran)

        data = {}
        for q in questions:
            # create json
            dat = {}
            dat['question'] = q.question_text
            answers = q.answer_set.all()
            a = []
            for answer in answers:
                n = (answer.pk, answer.text)
                a.append(n)
            dat['answers'] = a
            dat['lat'] = q.lat
            dat['lng'] = q.lon
            data[q.pk] = dat
    else:
        data = {'error': 'this was not a POST request'}

    return HttpResponse(json.dumps(data))

# ---------------------------------------------------------------------
"""
flag_questions receives question_pk and user_pk from Javascript, flags 
that question, and returns a success message that specifies how many 
flags the question now has.
"""
@csrf_exempt
def flag_question(request):
    question_pk = int(request.POST.get('question_pk'))
    user_pk = int(request.POST.get('user_pk'))

    try:
        user = User.objects.get(pk=user_pk)
        question = Question.objects.get(pk=question_pk)
        question.flags.add(user)
        data = {'success': 'question flagged; question now has {0} flags'.format(question.flags.count())}
    except:
        data = {'error':'question or user does not exist in database'}

    return HttpResponse(json.dumps(data))

# ---------------------------------------------------------------------
"""
get_data receives the answer_pk of the question that the user has just
selected from Javascript, and returns the set of data related to the 
question to which that answer relates in JSON, in the format that is 
specified by the formatAnswers method in custom_methods.py
"""
@csrf_exempt
def get_data(request):
    if request.method == 'POST':
        try:
            answer_pk = request.POST.get('answer_pk')
            q = Answer.objects.get(pk=answer_pk).question

            array = formatAnswers(q.answer_set.all())

            data = {'answers':array}
        except:
            data = {'error':'we couldn\'t find your question'}
    else:
        data = {'error': 'this was not a POST request'}
          
    return HttpResponse(json.dumps(data))

# ---------------------------------------------------------------------
"""
get_profile receives user_pk main_query, sub_query, rec_dir, pop_dir 
and scroll_index from Javascript. These variables represent different
features of the user's profile page - the relationship of the question
to the user, and the predominant sorting order in which to return those
questions. It then returns a set of questions that are relevant to that 
user in the following JSON format ('*'' represents variable data):
[
    {
        'qID': *question.pk*,
        'question': *question.question_text*,
        'answers': [ --see formatAnswers-- ]
    },
    {
        'qID': *question.pk*,
        'question': *question.question_text*,
        'answers': [ --see formatAnswers-- ]
    },
    ...
]
"""
@csrf_exempt
def get_profile(request):
    # number of questions to return in each AJAX call
    returncount = 30

    if request.method == 'POST':
        try:
            try:
                user_pk = int(request.POST.get('user_pk'))
                main_query = request.POST.get('main_query') # 'asked' or 'answered'
                sub_query = request.POST.get('sub_query') # 'popular' or 'recent'
                rec_dir = request.POST.get('rec_dir') # 'asc' or 'desc'
                pop_dir = request.POST.get('pop_dir') # 'asc' or 'desc'
                scroll_index = int(request.POST.get('scroll_index')) # 0-number
                user = User.objects.get(pk=user_pk)
            except:
                return HttpResponse(json.dumps({'error':'user not defined'}))

            # choose between questions answered, or questions asked
            if main_query == 'answered':
                questions = [ans.question for ans in user.answer_set.all()]
            elif main_query == 'asked':
                questions = user.question_created.all()
            else: # so as not to crash the system
                questions = []

            #sort by given query and directions; see sortByQuery in 
            #custom_methods.py       
            questions = sortByQuery(questions, sub_query, pop_dir, rec_dir)

            # store relevant questions in data, taking account of which
            # questions to return based on scroll_index, return returncount
            # number of questions
            start = returncount * scroll_index
            end = start + returncount
            #if end >= len(questions):
            #    end = len(questions) - 1
            outer_array = []
            for q in questions[start:end]:
                outer_dict = {}
                outer_dict['qID'] = q.pk
                outer_dict['question'] = q.question_text
                outer_dict['answers'] = formatAnswers(q.answer_set.all())
                outer_array.append(outer_dict)
            data = outer_array

        except:
            data = {'error': 'could not retrieve your data'}
    else:
        data = {'error': 'this was not a POST request'}

    return HttpResponse(json.dumps(data))

# ---------------------------------------------------------------------
"""
save_user receives info, a JSON string of the user's info that is 
sourced from Facebook API from Javascript, and then parses that JSON 
for the user's qualities. If the user already exists, the user's 
location is updated, and a success message is returned. If the user 
does not yet exist, a new user is created and a success message is 
returned.
"""
@csrf_exempt
def save_user(request):
    if request.method == 'POST':
        info = json.loads(request.POST.get('info'))
        fb_id = int(info['id'])
        name = info['name']
        gender = info['gender']
        birthday = datetime.strptime(info['birthday'], "%m/%d/%Y")
        lat = float(info['lat'])
        lon = float(info['lng'])

        try:
            if User.objects.filter(fb_id=fb_id).count() == 0:
                new_user = User(fb_id=fb_id, name=name, gender=gender, birthday=birthday, lat=lat, lon=lon)
                new_user.save()
                data = {'success': 'new user created', 'user_pk': new_user.pk}
            else:
                try:
                    user = User.objects.get(fb_id=fb_id)
                    user.lon = lon
                    user.lat = lat
                    user.save()
                    data = {'success': 'user info retrieved', 'user_pk': user.pk}
                except:
                    data = {'error': 'we have more than one representation of this user in the database'}
        except:
            data = {'error': 'user couldn\'t be saved (something is probably wrong with fb info sent)'}
    else:
        data = {'error': 'this was not a POST request'}

    return HttpResponse(json.dumps(data))

# ---------------------------------------------------------------------
"""
save_question receives question_text, user_pk and a JSON array of 
answers from Javascript. If a question of the exact same wording is not
already in the database, then the question is saved to the database 
and a success message is returned.
"""
@csrf_exempt
def save_question(request):
    if request.method == 'POST':
        question_text = request.POST.get('question_text')
        answers = json.loads(request.POST.get('answers'))
        user_pk = request.POST.get('user_pk')

        # checks for equivalence of text; could also do answers.
        #if Question.objects.filter(question_text=question_text).count() > 0:
        #    return HttpResponse(json.dumps({'error': 'this question is already in our database'}))

        # save the question to the database (checking of fields done on front end)
        try:
            user = User.objects.get(pk=user_pk)
            q = Question(question_text=question_text, creator=user, lat=user.lat, lon=user.lon)
            q.save()
            for answer in answers:
                a = Answer(question=q, text=answer)
                a.save()
            data = {'success': 'this question was saved at {0},{1} to {2}'.format(user.lat, user.lon, user.name)}
        except:
            data = {'error': 'your question couldn\'t be saved to the database'}
    else:
        data = {'error': 'this was not a POST request'}

    return HttpResponse(json.dumps(data))

# ---------------------------------------------------------------------
"""
save_answers receives user_pk, and a JSON array of answer_pks, which are
arrays, [*question_pk*, *answer_pk*, *poptime*], from Javascript. The
answers are saved to the user, and a success message is returend.
"""
@csrf_exempt
def save_answers(request):
    if request.method == 'POST':
        user_pk = int(request.POST.get('user_pk')) 
        answer_pks = json.loads(request.POST.get('answer_pks'))

        errors = {}
        user = User.objects.get(pk=user_pk)

        # bad variables, could change if i have time
        for pk in answer_pks:
            answer_pk = int(pk[1])
            poptime = int(pk[2]) # sent as time since epop

            dt = datetime.fromtimestamp(poptime/1000.0)

            try:
                answer = Answer.objects.get(pk=answer_pk)
                # check user has not already answered this question
                try:
                    user.answer_set.get(pk=a.pk)
                    raise Exception('you have already answered this question')
                except:
                    pass
                # all is well, add to database
                if user.answer_set.filter(question=answer.question).count()==0:
                    answer.users.add(user)
                    AnswerInfo(answer=answer,user=user,time=dt).save() # time set to now by default
                else:
                    errors[answer_pk] = "question is already in our database"

            except Exception as err:
                errors[answer_pk] = err
        if len(errors) == 0:
            data = {'success': 'all answers were recorded in the database'}
        else:
            data = {'error': 'several questions were not recorded in the database', 'errors_by_index': errors}
    else:
        data = {'error': 'this was not a POST request'}

    return HttpResponse(json.dumps(data))

# ---------------------------------------------------------------------
