from datetime import datetime
import json
from typing import Dict, List
from uuid import uuid4
from flask import Flask, request
from flask_restx import Api, Resource
from flask_cors import CORS
import os
from werkzeug.utils import secure_filename
import shutil

from langchain_ollama import OllamaEmbeddings
from langchain_ollama import ChatOllama

from langchain_community.vectorstores import FAISS
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyPDFDirectoryLoader


app = Flask(__name__)
CORS(app)
api = Api(app)


CHAT_FOLDER = "chats"
UPLOADED_DOCS_FOLDER = "input_docs"
VECTOR_DB_FOLDER = "vector_db"

embeddings = OllamaEmbeddings(model="bge-m3")
model = ChatOllama(model="mistral")

vector_db = None

# Remove docs on app start - we want to start fresh each time
if os.path.exists(UPLOADED_DOCS_FOLDER):
    shutil.rmtree(UPLOADED_DOCS_FOLDER)


def get_relevant_context(query: str):
    """Get relevant context from the vector database."""
    if vector_db is None:
        print("no vector_db")
        return None

    try:
        docs = vector_db.similarity_search_with_relevance_scores(
            query, k=5, score_threshold=0.2
        )
        context = "\n\n".join([doc[0].page_content for doc in docs])
        return context
    except Exception as e:
        print(f"error getting relevant context: {e}")
        return None


def generate_response(query: str):
    """Generate a response using the model and relevant context."""
    try:
        context = get_relevant_context(query)

        if context:
            prompt = f"The following is a query with some information provided. Please assess if the information is relevant to the query, as well as whether or not the user intends for you to answer using it. If it is relevant and you think that's what the user wants, use it to answer the query. Otherwise, answer with your general knowledge.\n\nINFORMATION:\n{context}\n\nQUERY:\n{query}\n\nRESPONSE: "
        else:
            prompt = f"QUERY:\n{query}\n\nRESPONSE: "

        return model.invoke(prompt).content
    except Exception as e:
        print(f"error generating response: {e}")
        return None


def init_rag():
    """Initialize the RAG by loading documents and creating a vector database."""
    global vector_db

    try:
        loader = PyPDFDirectoryLoader("input_docs")
        documents = loader.load()

        if not documents:
            print("no documents found")
            return False

        text_splitter = RecursiveCharacterTextSplitter()
        splits = text_splitter.split_documents(documents)

        vector_db = FAISS.from_documents(documents=splits, embedding=embeddings)
        vector_db.save_local(VECTOR_DB_FOLDER)

        return True
    except Exception as e:
        print(f"error loading documents: {e}")
        return False


def get_chat_threads() -> List[Dict[str, object]]:
    """Retrieve all chat threads from the chat directory."""
    chat_threads = []

    # Ensure the directory exists
    if not os.path.exists(CHAT_FOLDER):
        # Create the directory if it doesn't exist
        os.makedirs(CHAT_FOLDER, exist_ok=True)
        print(f"Chat directory {CHAT_FOLDER} created.")

    # Iterate over each file in the chat directory
    for filename in os.listdir(CHAT_FOLDER):
        file_path = os.path.join(CHAT_FOLDER, filename)

        # Only process JSON files
        if os.path.isfile(file_path) and filename.endswith(".json"):
            with open(file_path, "r") as f:
                try:
                    chat_data = json.load(f)

                    chat_thread = {
                        "id": chat_data.get("id"),
                        "title": chat_data.get("title"),
                        "createdAt": chat_data.get("createdAt"),
                        "updatedAt": chat_data.get("updatedAt"),
                    }

                    chat_threads.append(chat_thread)
                except json.JSONDecodeError:
                    print(f"Warning: Could not decode JSON from {file_path}")

    return chat_threads


def get_chat_thread(thread_id: str):
    """Retrieve a chat thread by id."""
    file_path = os.path.join(CHAT_FOLDER, f"{thread_id}.json")

    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Chat thread {thread_id} does not exist.")

    with open(file_path, "r") as f:
        try:
            return {"thread": json.load(f), "file_path": file_path}
        except json.JSONDecodeError:
            print(f"Warning: Could not decode JSON from {file_path}")
            return None


def send_message(message: str, thread_id: str):
    """Send a message to an existing chat thread and save the updated thread."""
    data = get_chat_thread(thread_id)

    if data is None:
        raise ValueError(f"Chat thread {thread_id} not found.")

    agent_reply = generate_response(message)

    data["thread"]["messages"].extend(
        [shape_message(message, True), shape_message(agent_reply, False)]
    )

    # Save the updated chat data back to the file
    with open(data["file_path"], "w") as f:
        json.dump(data["thread"], f)


def shape_message(message: str, is_user: bool):
    """Shape a chat message into structured format."""
    current_time = datetime.now().astimezone().isoformat(timespec="milliseconds")

    return {
        "id": str(uuid4()),
        "content": message.strip(),
        "isUser": is_user,
        "createdAt": current_time,
        "updatedAt": current_time,
    }


def create_chat_thread(message: str):
    """Create a new chat thread with initial message and agent reply."""
    agent_reply = generate_response(message)

    thread_title = "New Chat"
    current_time = datetime.now().astimezone().isoformat(timespec="milliseconds")

    thread = {
        "id": str(uuid4()),
        "title": thread_title,
        "createdAt": current_time,
        "updatedAt": current_time,
        "messages": [shape_message(message, True), shape_message(agent_reply, False)],
    }

    # Save the chat thread to a file
    with open(f"chats/{thread['id']}.json", "w") as f:
        json.dump(thread, f)

    return {"thread_id": thread["id"], "title": thread_title, "reply": agent_reply}


@api.route("/chat/<thread_id>")
class ChatThread(Resource):
    def get(self, thread_id):
        data = get_chat_thread(thread_id)

        if data is None:
            return {"message": f"Chat thread {thread_id} not found."}

        return data["thread"]["messages"]

    def post(self, thread_id):
        data = api.payload
        message = data.get("message", "")

        reply = send_message(message, thread_id)

        return {"reply": reply}


@api.route("/chat")
class Chat(Resource):
    def post(self):
        data = api.payload
        message = data.get("message", "")

        return create_chat_thread(message)


@api.route("/chats")
class Chats(Resource):
    def get(self):
        return get_chat_threads()


@api.route("/select_framework")
class SelectFramework(Resource):
    def post(self):
        data = request.get_json()
        data.get("frameworkId")


@api.route("/documents")
class Documents(Resource):
    def get(self):
        documents = []

        for root, _, files in os.walk(UPLOADED_DOCS_FOLDER):
            for file in files:
                timestamp = datetime.now().astimezone().isoformat(timespec="milliseconds")

                documents.append({
                    "id": str(uuid4()),
                    "name": file,
                    "createdAt": timestamp,
                    "updatedAt": timestamp
                })
        
        return documents
                

@api.route("/upload_docs")
class UploadDocs(Resource):
    def post(self):
        use_sample = request.args.get("useSample", default="false").lower() == "true"

        if os.path.exists(UPLOADED_DOCS_FOLDER):
            shutil.rmtree(UPLOADED_DOCS_FOLDER)

        os.makedirs(UPLOADED_DOCS_FOLDER, exist_ok=True)

        saved_files = []

        if use_sample:
            # Copy sample docs into input_docs
            sample_folder = "./sample_docs"
            for filename in os.listdir(sample_folder):
                src = os.path.join(sample_folder, filename)
                dst = os.path.join(UPLOADED_DOCS_FOLDER, filename)
                shutil.copy2(src, dst)
                saved_files.append(filename)
        else:
            if "file" not in request.files:
                return {"message": "No files part in the request"}, 400

            files = request.files.getlist("file")
            for file in files:
                filename = secure_filename(file.filename or "uploaded_file")
                save_path = os.path.join(UPLOADED_DOCS_FOLDER, filename)
                file.save(save_path)
                saved_files.append(filename)

        init_rag()

        return {"message": "Files uploaded successfully", "files": saved_files}


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=9009)
