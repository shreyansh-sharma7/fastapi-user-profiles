import os
from typing import Optional, Annotated, List, Literal
from fastapi import FastAPI, Form, HTTPException
from supabase import create_client, Client
from dotenv import load_dotenv
import google.generativeai as genai
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware


load_dotenv()

url: str = os.getenv("SUPABASE_URL")
key: str = os.getenv("SUPABASE_KEY")
api_key:str = os.getenv("GEMINI_API_KEY")

supabase: Client = create_client(url, key)
app = FastAPI()

# CORS MANAGEMENT
origins=["http://localhost:3000"]
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_methods=["*"],allow_headers=["*"], allow_credentials=True)

genai.configure(api_key=api_key)
model=genai.GenerativeModel("gemini-flash-latest")


class Subtopic(BaseModel):
    title: str
    content: str
    video_resources: Optional[List[str]] = None
    text_resources: Optional[List[str]] = None

class Topic(BaseModel):
    title: str
    content:Optional[str]=None
    subtopics: List[Subtopic]

class Module(BaseModel):
    title: str
    content:Optional[str]=None
    topics: List[Topic]

class Options(BaseModel):
    prompt:str
    completion_time_days:int
    course_weight:Literal["heavy","light"]
    user_experience:Literal["beginner","intermediate","expert"]
    user_why:str
    user_prerequisites:str
    learner_type:Literal["normal","fast"]

class Course(BaseModel):
    title: str
    modules: List[Module]
    metadata:Options

@app.post("/create-course")
def create_course(options: Options):
    
    # Use .model_dump_json() for a cleaner prompt
    options_json = options.model_dump_json(indent=2)
    schema_json = Course.model_json_schema()
    prompt_structure = f"""
## ROLE ##
You are an expert curriculum designer...

## CONTEXT ##
A user wants to learn a new subject. They have provided the following user options:
{options_json}

## TASK ##
Your task is to generate a comprehensive, structured course outline based on the user's learning goal...

## OUTPUT CONSTRAINTS ##
Your response MUST be a single, valid JSON object. Do not include any introductory text, markdown formatting, or explanations outside of the JSON. The JSON object must strictly adhere to the following Pydantic schema:
{schema_json}"""

    try:
        response = model.generate_content(
            prompt_structure,
        )

        # Check if the response was blocked
        if not response.parts:
            print(f"Response was blocked. Feedback: {response.prompt_feedback}")
            raise HTTPException(status_code=500, detail="Failed to generate course due to safety restrictions.")

        # It converts the JSON string from Gemini into a valid Course object.
        course_data = Course.model_validate_json(response.text)
        
        # 7. Return the Pydantic object. FastAPI will serialize it to JSON.
        return course_data

    except json.JSONDecodeError as e:
        print(f"--- FAILED TO DECODE JSON ---")
        print(f"Error: {e}")
        print(f"Raw response from Gemini: {response.text}")
        raise HTTPException(status_code=500, detail="Model returned invalid JSON.")
    
    except Exception as e:
        # Handle other potential errors (e.g., Pydantic validation error)
        print(f"--- AN ERROR OCCURRED ---")
        print(f"Error: {e}")
        print(f"Raw response from Gemini: {response.text}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {e}")