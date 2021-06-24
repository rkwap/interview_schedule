import os
import requests


def run_query(query, variables={}):
    body = {
        'query': query,
        'variables': variables
    }
    response = _make_post_call(body)
    if response.get('data') is not None:
        return response.get('data')
    raise RuntimeError('query failed: ' + str(response))


def _make_post_call(body):
    url = "https://rkwap-heroku.hasura.app/v1/graphql"
    headers = {
        'Content-type': 'application/json',
        'x-hasura-admin-secret': "ceHA0ixak3z76FC1Nkup6NdCqC6bh6HQd1dMPwT8wbACLwcaiUeDII640FeHhit7"
    }
    # print("HASURA_CLIENT_POST_CALL")
    # print("URL : " + url)
    # print("BODY : " + str(body))
    response = requests.post(url, json=body, headers=headers, timeout=10)
    # print("RESPONSE : " + str(response.json()))
    return response.json()


query='''
    query ($id: uuid){
        userinterview_mapping (where:{id:{_eq:$id}}){
            interview_object {
                id
                full_name
                email
                phone_number
            }
        }
    }
'''

variables={"id":"cb4e5f98-b517-48ff-893d-fa67eccc1042"}

response=run_query(query,variables)
print(response)

