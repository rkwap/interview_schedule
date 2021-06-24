import React, { useState } from "react";
import { useRouter } from "next/router";
import Datetime from "react-datetime";
import "react-datetime/css/react-datetime.css";
import Select from "react-select";


// components
// import CardBarChart from "components/Cards/CardBarChart.js";
// import CardPageVisits from "components/Cards/CardPageVisits.js";
import UpcomingInterview from "components/Cards/UpcomingInterview.js";
// import CardSocialTraffic from "components/Cards/CardSocialTraffic.js";

// layout for page

import Admin from "layouts/Admin.js";





export async function getStaticProps() {
    const options = {
        method: 'GET',
    }
    const fetchResponse = await fetch('http://127.0.0.1:4000/pending/viewall/')
    const responseJson = await fetchResponse.json();
    // console.log(responseJson);
    const interview_data = responseJson.data.interviews
    // console.log(data)

    const useridResponse = await fetch('http://127.0.0.1:4000/users/getnameid/')
    const usersresponseJson = await useridResponse.json();
    // console.log(responseJson);
    const user_data = usersresponseJson.data.users


    return {
        props: { interviews: interview_data, users:user_data },
    }
}

export default function Dashboard({ interviews, users}) {
    // console.log(interviews)
    const router = useRouter();
    const [showModal, setShowModal] = React.useState(false);
    const [Edit, setEdit] = React.useState(null);
    const [EditDetails, setEditDetails] = React.useState(false);
    const [Interviewdata,setInterviewdata] = React.useState({})


    const CreateInterview = async event => {
        event.preventDefault()

        const res = await fetch(
            'http://127.0.0.1:4000/create/',
            {
            body: JSON.stringify({
                name: event.target.name.value,
                start_time: event.target.start_time.value,
                end_time:event.target.end_time.value,
                // users:[event.target.user_1.value,event.target.user_2.value,event.target.user_3.value],
                users:Array.from(event.target.users_select, option => option.value)
            }),
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'POST'
            }
        )

        const result = await res.json()

        var obj = { key: undefined };
        if (result["status"] !== undefined){
            setShowModal(true);
            alert(result['status']);
        } 
        else{
            setShowModal(false);
            alert("Interview successfully scheduled!");
            window.location.reload(false);
        }

    }

    const UpdateInterview = async event => {
        event.preventDefault()

        const res = await fetch(
            'http://127.0.0.1:4000/update/'+Interviewdata[0].id+'/',
            {
            body: JSON.stringify({
                name: event.target.name.value,
                start_time: event.target.start_time.value,
                end_time:event.target.end_time.value,
                users:Array.from(event.target.users_select, option => option.value)
            }),
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'POST'
            }
        )

        const result = await res.json()

        var obj = { key: undefined };
        if (result["status"] !== undefined){
            setShowModal(true);
            alert(result['status']);
        } 
        else{
            setShowModal(false);
            alert("Interview successfully updated!");
            window.location.reload(false);
        }

    }

    const DeleteInterview = async event => {
        event.preventDefault()
        if (confirm("Do you want to delete the interview?")){
            const res = await fetch(
                'http://127.0.0.1:4000/delete/'+event.target.value+'/',
                {
                body: JSON.stringify({
                    id: event.target.value
                }),
                headers: {
                    'Content-Type': 'application/json'
                },
                method: 'POST'
                }
            )

            const result = await res.json()
            
            setEditDetails(false);
            window.location.reload(false);
        }

        // var obj = { key: undefined };
        // if (result["status"] !== undefined){
        //     setShowModal(true);
        //     alert(result['status']);
        // } 
        // else{
        //     setShowModal(false);
        //     alert("Interview successfully scheduled!");
        //     window.location.reload(false);
        // }

    }

    const EditRequest = async event => {
        event.preventDefault()
        // alert(event.target.value)
        // console.log(event)


        const edit_response = await fetch('http://127.0.0.1:4000/pending/get_interview/'+event.target.value+'/')
        const edit_res = await edit_response.json();
        // console.log(responseJson);
        const interview_data = edit_res.data.interviews
        setEdit(true)
        setInterviewdata(interview_data);
        return interview_data
    }






    const [fields, setFields] = useState([{ value: null }]);

    function handleChange(i, event) {
        const values = [...fields];
        values[i].value = event.target.value;
        setFields(values);
        console.log("testing")
    }

    function handleAdd() {
        const values = [...fields];
        values.push({ value: null });
        setFields(values);
    }

    function handleRemove(i) {
        const values = [...fields];
        values.splice(i, 1);
        setFields(values);
    }
    

    // const options = [
    //     { value: "a", label: "Chocolate" },
    //     { value: "b", label: "Strawberry" },
    //     { value: "c", label: "Vanilla" },
    // ];
    
    // let options=[]
    // for (i of users){
    //     options.push({
    //         value: i.id,
    //         label: i.full_name
    //     })
    // }

    // console.log("#################")
    // console.log(users)

    return (
        <>
            <div className="flex flex-wrap">
                {/* Upcoming Interviews start*/}



                {/* New Interview Modal */}
                {/* Create New Modal */}
                {showModal ? (
                    <>
                        <div
                            className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none"
                        >
                            <div className="relative w-auto my-6 mx-auto max-w-3xl">

                                {/*content*/}
                                <div style={{ height: "30rem", marginTop: "-5rem", width: "65%", marginRight: "3rem", position: "fixed" }} className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                                    {/*header*/}
                                    <div className="flex items-start justify-between p-5 border-b border-solid border-blueGray-200 rounded-t">
                                        <h3 className="text-3xl font-semibold">
                                            Schedule interview
                </h3>
                                        <button
                                            className="p-1 ml-auto bg-transparent border-0 text-black opacity-5 float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                                            onClick={() => setShowModal(false)}
                                        >
                                            <span className="bg-transparent text-black opacity-5 h-6 w-6 text-2xl block outline-none focus:outline-none" onClick={() => setShowModal(false)}>
                                                ×
                    </span>
                                        </button>
                                    </div>
                                    {/*body*/}
                    



    <form id="create" onSubmit={CreateInterview}>


    <div style={{padding:"3em"}}>

        <div className="flex p-6">

            <label htmlFor="name"><b>Start Time:&nbsp;&nbsp;&nbsp;&nbsp;</b></label>
            <Datetime inputProps={{ autoComplete:"off", placeholder: "Start Date and Time", name: "start_time",id:"start_time", required:true, class: "px-6 py-3 placeholder-blueGray-300 text-blueGray-600 relative bg-white bg-white rounded text-sm shadow outline-none focus:outline-none focus:shadow-outline "}} />

            <label htmlFor="name"><b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;End Time:&nbsp;&nbsp;&nbsp;&nbsp;</b></label>
            <Datetime inputProps={{ autoComplete:"off", placeholder: "Start Date and Time", name: "end_time",id:"end_time", required:true, class: "px-6 py-3 placeholder-blueGray-300 text-blueGray-600 relative bg-white bg-white rounded text-sm shadow outline-none focus:outline-none focus:shadow-outline " }} />

        </div>
        <br></br><br></br><br></br>

        <label htmlFor="name"><b>Add Participants</b></label>
        <Select inputProps={{autoComplete:"off", placeholder: "Select participants", required:true, class: "px-1 py-3 placeholder-blueGray-300 text-blueGray-600 relative bg-white bg-white rounded text-sm shadow outline-none focus:outline-none focus:shadow-outline "}} name="users_select" id="users_select" isMulti={true} options={users} />


    </div>
        
    


                                    <div className="relative p-6 flex-auto">
                                        {/* <div class="mb-3 pt-0" style={{ marginLeft: "2em", marginTop: "2em" }}>
                                            Enter Start Time
                <Datetime inputProps={{ placeholder: "Start Date and Time", name: "start_time", class: "px-3 py-3 placeholder-blueGray-300 text-blueGray-600 relative bg-white bg-white rounded text-sm shadow outline-none focus:outline-none focus:shadow-outline " }} />
                                        </div> */}

            
                                    </div>

                                    {/*footer*/}
                                    <div className="footer flex items-center justify-end p-6 border-t border-solid border-blueGray-200 rounded-b">
                                        
                                        <button
                                            className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                                            type="button"
                                            onClick={() => setShowModal(false)}
                                        >
                                            Close
                </button>
                                        <button
                                            className="bg-emerald-500 text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                                            type="button" type="submit"
                                            onClick={() => setShowModal(true)}
                                        >
                                            Create
                </button>

                                    </div>

</form> 


                                </div>

                            </div>
                            
                        </div>


                        <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
                    </>
                ) : null}

                {/* ## Create Modal End                             */}
                                




                 {/* ## Edit Modal                */}
                {Edit ? (
                <>
                 <div
                            className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none"
                        >
                            <div className="relative w-auto my-6 mx-auto max-w-3xl">

                                {/*content*/}
                                <div style={{ height: "30rem", marginTop: "-5rem", width: "65%", marginRight: "3rem", position: "fixed" }} className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                                    {/*header*/}
                                    <div className="flex items-start justify-between p-5 border-b border-solid border-blueGray-200 rounded-t">
                                        <h3 className="text-3xl font-semibold">
                                            Schedule interview
                </h3>
                                        <button
                                            className="p-1 ml-auto bg-transparent border-0 text-black opacity-5 float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                                            onClick={() => setShowModal(false)}
                                        >
                                            <span className="bg-transparent text-black opacity-5 h-6 w-6 text-2xl block outline-none focus:outline-none" onClick={() => setEdit(false)}>
                                                ×
                    </span>
                                        </button>
                                    </div>
                                    {/*body*/}
                    



    <form id="update" onSubmit={UpdateInterview}>

    <div style={{padding:"3em"}}>

        <div className="flex p-6">

            <label htmlFor="name"><b>Start Time:&nbsp;&nbsp;&nbsp;&nbsp;</b></label>
            <Datetime inputProps={{  autoComplete:"off", placeholder: "Start Date and Time", name: "start_time",id:"start_time", required:true, class: "px-6 py-3 placeholder-blueGray-300 text-blueGray-600 relative bg-white bg-white rounded text-sm shadow outline-none focus:outline-none focus:shadow-outline "}} />

            <label htmlFor="name"><b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;End Time:&nbsp;&nbsp;&nbsp;&nbsp;</b></label>
            <Datetime inputProps={{ autoComplete:"off", placeholder: "Start Date and Time", name: "end_time",id:"end_time", required:true, class: "px-6 py-3 placeholder-blueGray-300 text-blueGray-600 relative bg-white bg-white rounded text-sm shadow outline-none focus:outline-none focus:shadow-outline " }} />

        </div>
        <br></br><br></br><br></br>

        <label htmlFor="name"><b>Add Participants</b></label>
        <Select inputProps={{autoComplete:"off", placeholder: "Select participants", required:true, class: "px-1 py-3 placeholder-blueGray-300 text-blueGray-600 relative bg-white bg-white rounded text-sm shadow outline-none focus:outline-none focus:shadow-outline "}} name="users_select" id="users_select" isMulti={true} options={users} />


    </div>
        
    


                                    <div className="relative p-6 flex-auto">
                                        {/* <div class="mb-3 pt-0" style={{ marginLeft: "2em", marginTop: "2em" }}>
                                            Enter Start Time
                <Datetime inputProps={{ placeholder: "Start Date and Time", name: "start_time", class: "px-3 py-3 placeholder-blueGray-300 text-blueGray-600 relative bg-white bg-white rounded text-sm shadow outline-none focus:outline-none focus:shadow-outline " }} />
                                        </div> */}

            
                                    </div>

                                    {/*footer*/}
                                    <div className="footer flex items-center justify-end p-6 border-t border-solid border-blueGray-200 rounded-b">
                                        
                                        <button
                                            className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                                            type="button"
                                            onClick={() => setEdit(false)}
                                        >
                                            Close
                </button>
                                        <button
                                            className="bg-emerald-500 text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                                            type="button" type="submit"
                                            onClick={() => setEdit(false)}
                                        >
                                            Save Changes
                </button>

                                    </div>

</form> 


                                </div>

                            </div>
                            
                        </div>


                        <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>




                </>) : null}

                {/* ## Update modal ends here */}










                <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded">

                    <div className="rounded-t mb-0 px-4 py-3 border-0">
                        <div className="flex flex-wrap items-center">
                            <div className="relative w-full px-4 max-w-full flex-grow flex-1">
                                <h3 className="font-semibold text-base text-blueGray-700">
                                    Upcoming Interviews
            </h3>
                            </div>
                            <div className="relative w-full px-4 max-w-full flex-grow flex-1 text-right">

                            {EditDetails ? <>
                                <button
                                    className="bg-pink-500 text-white active:bg-pink-600 text-xs font-bold uppercase px-3 py-1 rounded outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                                    type="button" onClick={() => setEditDetails(false)}
                                >
                                <i className={"fas fa-check mr-2 text-sm " }></i>{" "}
                                    Done Edits
                                </button>

                            
                            </> : 
                            <>
                            {(interviews.length>0) ? 
                            <button
                                    className="bg-indigo-500 text-white active:bg-indigo-600 text-xs font-bold uppercase px-3 py-1 rounded outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                                    type="button" onClick={() => setEditDetails(true)}
                                >
                                <i className={"fas fa-pencil-alt mr-2 text-sm " }></i>{" "}
                                    Edit Details
                                </button> : null}
                            </>
                            
                            }
                                



                                <button
                                    className="bg-emerald-500 text-white active:bg-emerald-600 text-xs font-bold uppercase px-3 py-1 rounded outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                                    type="button" onClick={() => setShowModal(true)}
                                >
                                <i className={"fas fa-plus mr-2 text-sm " }></i>{" "}
                                    Schedule New
                                </button>


                                
            
            

                            </div>
                        </div>
                    </div>
                    <div className="block w-full overflow-x-auto">
                        {/* Projects table */}
                        {(interviews.length==0) ?
                            <p>Currently, no interviews are scheduled</p> :
                            <table className="items-center w-full bg-transparent border-collapse">
                                <thead>
                                    <tr>
                                        <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                                            Day
                    </th>
                                        <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                                            Start Time
                    </th>
                                        <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                                            End Time
                    </th>
                                        <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                                            Participants
                    </th>
                    
                                    </tr>
                                </thead>
                                <tbody>



                                    {interviews.map((interview) =>
                                        <tr>
                                            <th className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left">
                                                {interview.day}
                                            </th>
                                            <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                                                {interview.start_time_formatted}
                                            </td>
                                            <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                                                {interview.end_time_formatted}
                    </td>
                                            <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                                                {interview.participants}
                                            </td>
                                        
                                        {EditDetails ? <>

                                            <td>
                                                <button
                                                    className="bg-indigo-500 text-white active:bg-indigo-600 text-xs font-bold uppercase px-3 py-1 rounded outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                                                    type="button" id="edit" name="edit" value={interview.id} onClick={(e) => {EditRequest(e);} }
                                                >
                                                <i className={"fas fa-pencil-alt mr-2 text-sm " }></i>{" "}
                                                    Edit
                                                </button>
                                                <button
                                                    className="bg-red-500 text-white active:bg-indigo-600 text-xs font-bold uppercase px-3 py-1 rounded outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                                                    type="button" id="edit" name="edit" value={interview.id} onClick={(e) => {DeleteInterview(e);} }
                                                >
                                                <i className={"fas fa-pencil-alt mr-2 text-sm " }></i>{" "}
                                                    Delete
                                                </button>
                                            </td>

                                            </>
                                            :null}
                                        </tr>
                                    )
                                    }

                                </tbody>
                            </table>
                        }
                    </div>
                </div>

                {/* Upcoming interviews end */}
            </div>
            {/* <div className="flex flex-wrap mt-4" style={{height:"60vh", maxHeight:"auto"}}> */}
                {/* <div className="w-full xl:w-8/12 mb-12 xl:mb-0 px-4">
        
    </div> */}
                {/* <div className="w-full xl:w-4/12 px-4">
        <CardSocialTraffic />
    </div> */}
            {/* </div> */}
        </>
    );
}

Dashboard.layout = Admin;

