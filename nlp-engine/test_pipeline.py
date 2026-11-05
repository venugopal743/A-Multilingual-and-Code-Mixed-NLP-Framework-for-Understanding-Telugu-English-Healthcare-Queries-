import asyncio
from app.api.chat import chat_pipeline_endpoint, ChatRequest

async def main():
    queries = [
        "Naaku 2 days nunchi fever and headache undi.",
        "Mujhe kal se sar dard aur bukhar hai.",
        "Warangal lo nearest hospital ekkada?",
        "Emergency! Patient has severe chest pain!"
    ]
    for q in queries:
        req = ChatRequest(text=q)
        res = await chat_pipeline_endpoint(req)
        print("=" * 60)
        print("Query:", q)
        print("Detected Lang:", res["detected_language"])
        print("Intent:", res["analysis"]["intent"]["intent"])
        print("Symptoms:", res["analysis"]["ner"]["symptoms"])
        print("AI Response snippet:", res["ai_response"][:100].replace('\n', ' '))
        print("Sources retrieved:", len(res["analysis"]["rag"]["retrieved_docs"]))

if __name__ == "__main__":
    asyncio.run(main())
