from flask.wrappers import Response
from app import *
import requests
import urllib.request, json

main = Blueprint('main', __name__)

## Get names and ids of all users
@main.route("/users/getnameid/", methods=['GET'])
def get_nameid():
    query='''
        query {
            users (order_by:{full_name:asc}){
                id
                full_name
            }
        }

    '''
    variables={}
    response=run_query(query,variables)
    data=response
    for user in response['data']['users']:
        user['value']=user['id']
        user['label']=user['full_name']    
    return response,200


## Get all details of a certain interview_id
@main.route("/pending/get_interview/<string:id>/", methods=['GET'])
def get_interview(id):
    query='''
        query ($id: uuid!) {
            interviews(where: {id: {_eq: $id}, is_active: {_eq: true}}) {
                mapping_details {
                    user_details {
                        id
                        full_name
                        email
                        phone_number
                    }
                }
                start_time
                end_time
                is_active
                resume
            }
        }
    '''
    variables={"id":id}
    response=run_query(query,variables)
    print(response)
    return response,200


## Get all interviews for a user
@main.route("/pending/user_interviews/<string:id>/", methods=['POST'])
def user_interviews(id):
    query='''
        query ($id :uuid!){
            userinterview_mapping (where:{user_id:{_eq:$id}}){
                interview_id
            }
        }
    '''
    variables={"id":id}
    response=run_query(query,variables)
    return response,200


## Returns all pending interviews
@main.route("/pending/viewall/", methods=['GET'])
def pending_viewall():
    query='''
        query{
            interviews (where:{is_active:{_eq:true}}, order_by: {start_time: asc}){
                id
                mapping_details {
                    user_details{
                        id
                        full_name
                        email
                        phone_number
                    }
                }
                start_time
                end_time
                is_active
                resume
            }
        }   
    '''
    variables={}
    response=run_query(query,variables)

    all_interviews=response["data"]["interviews"]
    for interview in all_interviews:
        start_time=interview["start_time"]
        presentday = datetime.datetime.today().replace(hour=0, minute=0, second=0, microsecond=0)
        yesterday = presentday - datetime.timedelta(days=1)
        tomorrow = presentday + datetime.timedelta(days=1)

        date_string = start_time[:10]
        date = datetime.datetime.strptime(date_string,"%Y-%m-%d").replace(hour=0, minute=0, second=0, microsecond=0)
        day=""
        if date==presentday:
            day=date.strftime("Today, %d %b %Y")
        elif date==tomorrow:
            day=date.strftime("Tomorrow, %d %b %Y")
        else:
            day=date.strftime("%A, %d %b %Y")
        interview["day"]=day

        start_time=interview["start_time"][11:16]
        end_time=interview["end_time"][11:16]

        start_time=datetime.datetime.strptime(start_time, "%H:%M").strftime("%I:%M %p")
        end_time=datetime.datetime.strptime(end_time, "%H:%M").strftime("%I:%M %p")
        
        interview["start_time_formatted"]=start_time
        interview["end_time_formatted"]=end_time


        participants=""
        for user in interview["mapping_details"]:
            participants+=user["user_details"]["full_name"]+", "
        participants=participants[:-2]

        interview["participants"]=participants
        # print(interview["user_details"])


    return response,200


## Creates a single interview
@main.route("/create/", methods=['POST'])
def create():
    data=request.get_json()
    # print(data)
    start_time=data["start_time"]
    end_time=data["end_time"]
    users=data["users"]

    ## Minimum number of users validation
    if len(users)<2:
        print("Please select atleast 2 users")
        return {"status":"Please select atleast 2 users"},400
    


    start_time=datetime.datetime.strptime(start_time, '%m/%d/%Y %I:%M %p')
    end_time=datetime.datetime.strptime(end_time, '%m/%d/%Y %I:%M %p')

    ## users not available validation
    for user in users:
        ## query to get all start and end times of interviews of a user
        query='''
        query ($id: uuid!) {
            userinterview_mapping(where: {user_id: {_eq: $id}, interview_details: {is_active: {_eq: true}}}) {
                interview_details {
                start_time
                end_time
                }
            }
        }
        '''
        variables={"id":user}

        response=run_query(query,variables)['data']['userinterview_mapping']
        
        for interview in response:
            curr_start_time=interview['interview_details']['start_time'][:16]
            curr_end_time=interview['interview_details']['end_time'][:16]
            curr_start_time=datetime.datetime.strptime(curr_start_time, "%Y-%m-%dT%H:%M")
            curr_end_time=datetime.datetime.strptime(curr_end_time, "%Y-%m-%dT%H:%M")
            
            ## Calculating timestamps for comparisons
            curr_start_timestamp=datetime.datetime.timestamp(curr_start_time)
            curr_end_timestamp=datetime.datetime.timestamp(curr_end_time)
            start_timestamp=datetime.datetime.timestamp(start_time)
            end_timestamp=datetime.datetime.timestamp(end_time)

            # print(curr_start_timestamp,"C########")
            # print(curr_end_timestamp,"C********")
            # print(start_timestamp,"########")
            # print(end_timestamp,"********")


            # check for overlaping intervals
            if (curr_start_timestamp<=start_timestamp and curr_end_timestamp<=start_timestamp) or (curr_start_timestamp>=end_timestamp and curr_end_timestamp>=end_timestamp):
                pass
            else:
                print(data)
                print("Participants are not available during the scheduled time!")
                return {"status":"Participants are not available during the scheduled time!"},400





    start_time=datetime.datetime.strptime(data["start_time"], '%m/%d/%Y %I:%M %p').strftime('%Y-%m-%dT%H:%M:%S.00+00:00')
    end_time=datetime.datetime.strptime(data["end_time"], '%m/%d/%Y %I:%M %p').strftime('%Y-%m-%dT%H:%M:%S.00+00:00')

    ## query to insert a single interview details
    query='''
        mutation insertInterviews ($interview_objects: [interviews_insert_input!]!){
            insert_interviews(objects: $interview_objects){
                    returning{
                    id
                }
            }
        }
    '''

    variables={"interview_objects":
        {
            "start_time":start_time,
            "end_time":end_time
        }
    }
    response=run_query(query,variables)
    # print(response['data']['insert_interviews'])
    interview_id=response["data"]["insert_interviews"]["returning"][0]["id"]


    ## query to insert rows of participants in mapping table
    query='''
    mutation insertInterviewMapping ($user_interview__mapping_objects: [userinterview_mapping_insert_input!]!){
        insert_userinterview_mapping(objects: $user_interview__mapping_objects){
            affected_rows
        }
    }
    '''
    mapping_objects=[]
    for user in users:
        mapping_objects.append({"user_id":user,"interview_id":interview_id})
    
    variables = {
        "user_interview__mapping_objects": mapping_objects
    }

    response=run_query(query,variables)

    print(response)


    ## All operations done, now sending emails to participants

    for user in users:
        query='''
        query userDetails($id: uuid!) {
            users(where: {id: {_eq: $id}}) {
                full_name
                email
            }
        }

        '''
        variables = {"id": user}
        response=run_query(query,variables)
        print(response)
        email=response['data']['users'][0]['email']

        # for sending email (setup email settings before using this)
        '''
        ## Composing Mail
        title="Interview Scheduled!"
        sender="admin@admin.com"
        recipients = [email]
        message_html = "<b>Your Interview is scheduled</b>"
        send_mail(title,sender,recipients,message_html) # Sending Mail
        ## End of Mail
        '''



    # print(start_time,type(start_time))

    return response,200


## Updates a single interview
@main.route("/update/<string:id>/", methods=['POST'])
def update_interview(id):
    data=request.get_json()
    start_time=data["start_time"]
    end_time=data["end_time"]
    users=data["users"]

    ## Minimum number of users validation
    if len(users)<2:
        return {"status":"Please select atleast 2 users"},400

    start_time=datetime.datetime.strptime(start_time, '%m/%d/%Y %I:%M %p').strftime('%Y-%m-%dT%H:%M:%S.00+00:00')
    end_time=datetime.datetime.strptime(end_time, '%m/%d/%Y %I:%M %p').strftime('%Y-%m-%dT%H:%M:%S.00+00:00')

    ## query to update an interview details
    query='''
        mutation updateInterview ($id: uuid!, $start_time: timestamptz!, $end_time:timestamptz!){
            update_interviews(where: {id: {_eq: $id}}, _set: {start_time: $start_time, end_time: $end_time}){
                affected_rows
            }
        }
    '''
    
    variables={
        "id": id,
        "start_time": start_time,
        "end_time": end_time
    }

    response=run_query(query,variables)
    
    ## Delete all mappings of the interview_id
    res=delete_mapping(id)

    ## Inserting  new mappings

    ## query to insert rows of participants in mapping table
    query='''
    mutation insertInterviewMapping ($user_interview__mapping_objects: [userinterview_mapping_insert_input!]!){
        insert_userinterview_mapping(objects: $user_interview__mapping_objects){
            affected_rows
        }
    }
    '''
    mapping_objects=[]
    for user in users:
        mapping_objects.append({"user_id":user,"interview_id":id})
    
    variables = {
        "user_interview__mapping_objects": mapping_objects
    }

    response=run_query(query,variables)
    print(response,"##############################")

    return response,200


## Delete a single interview
@main.route("/delete/<string:id>/", methods=['POST'])
def delete(id):
    ## query to delete a single mapping row from the iserinterview_mapping table
    query='''
        mutation deleteInterview($id: uuid!){
            delete_interviews(where: {id: {_eq: $id}}){
		        affected_rows
            }
        }
    '''
    variables={"id": id}
    data=request.get_json()
    response=run_query(query,variables)
    print(response)
    return response,200


## Delete a single interview_mapping
@main.route("/delete/mapping/<string:id>/", methods=['POST'])
def delete_mapping(id):
    ## query to delete a single mapping row from the iserinterview_mapping table
    query='''
        mutation deleteInterviewMapping ($interview_id: uuid!){
            delete_userinterview_mapping(where: {interview_id: {_eq: $interview_id}}){
		        affected_rows
            }
        }
    '''
    variables={"interview_id": id}

    response=run_query(query,variables)
    return response,200



## Returns all done/archived interviews
@main.route("/archive/viewall/", methods=['GET'])
def archive_viewall():
    query='''
        query{
            interviews (where:{is_active:{_eq:false}}){
                id
                mapping_details {
                    user_details{
                        id
                        full_name
                        email
                        phone_number
                    }
                }
                start_time
                end_time
                is_active
                resume
            }
        }   
    '''
    variables={}
    response=run_query(query,variables)

    all_interviews=response["data"]["interviews"]
    for interview in all_interviews:
        start_time=interview["start_time"]
        presentday = datetime.datetime.today().replace(hour=0, minute=0, second=0, microsecond=0)
        yesterday = presentday - datetime.timedelta(days=1)
        tomorrow = presentday + datetime.timedelta(days=1)

        date_string = start_time[:10]
        date = datetime.datetime.strptime(date_string,"%Y-%m-%d").replace(hour=0, minute=0, second=0, microsecond=0)
        day=""
        if date==presentday:
            day=date.strftime("Today, %d %b %Y")
        elif date==tomorrow:
            day=date.strftime("Tomorrow, %d %b %Y")
        else:
            day=date.strftime("%A, %d %b %Y")
        interview["day"]=day

        start_time=interview["start_time"][11:16]
        end_time=interview["end_time"][11:16]

        start_time=datetime.datetime.strptime(start_time, "%H:%M").strftime("%I:%M %p")
        end_time=datetime.datetime.strptime(end_time, "%H:%M").strftime("%I:%M %p")
        
        interview["start_time_formatted"]=start_time
        interview["end_time_formatted"]=end_time


        participants=""
        for user in interview["mapping_details"]:
            participants+=user["user_details"]["full_name"]+", "
        participants=participants[:-2]

        interview["participants"]=participants
        # print(interview["user_details"])


    return response,200
