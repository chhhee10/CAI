import asyncio
import os
from dotenv import load_dotenv
from hindsight_client import Hindsight

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

async def clear_bank():
    print("Connecting to Hindsight...")
    hindsight = Hindsight(
        base_url=os.environ.get("HINDSIGHT_API_URL", "https://api.hindsight.vectorize.io"),
        api_key=os.environ.get("HINDSIGHT_API_KEY")
    )
    
    bank_name = "HWD"
    print(f"Deleting memory bank '{bank_name}' to wipe all old data...")
    try:
        await hindsight.adelete_bank(bank_id=bank_name)
        print("Bank deleted successfully.")
    except Exception as e:
        print(f"Could not delete bank (it might not exist or API restricts it): {e}")
        
    print(f"Recreating a fresh memory bank '{bank_name}'...")
    try:
        await hindsight.acreate_bank(bank_id=bank_name)
        print("Fresh bank created successfully! The knowledge base is now clean.")
    except Exception as e:
        print(f"Could not recreate bank: {e}")
        print("You may need to manually recreate it in the Vectorize Dashboard.")

if __name__ == "__main__":
    asyncio.run(clear_bank())
