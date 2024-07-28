from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import crud, models, schemas
from ..database import get_db
from ..auth import get_current_user
import httpx

router = APIRouter()

BANGUMI_API_URL = "https://api.bgm.tv/search/subject/{}"

@router.get("/search/{media_type}/{query}", response_model=list[schemas.BangumiSearchResult])
async def search_bangumi(media_type: int, query: str):
    async with httpx.AsyncClient() as client:
        response = await client.get(BANGUMI_API_URL.format(query), params={"type": media_type, "responseGroup": "medium"})
    
    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail="Failed to fetch data from Bangumi API")
    
    data = response.json()
    return [schemas.BangumiSearchResult(
        id=item['id'],
        title=item['name'],
        image=item.get('images', {}).get('small', ''),
        summary=item.get('summary', ''),
        type=item['type']
    ) for item in data['list']]

@router.post("/add/{bangumi_id}", response_model=schemas.UserMedia)
def add_to_user_list(
    bangumi_id: int, 
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    # 首先，从 Bangumi API 获取详细信息
    response = httpx.get(f"https://api.bgm.tv/subject/{bangumi_id}")
    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail="Failed to fetch data from Bangumi API")
    
    bangumi_data = response.json()
    
    # 创建新的 UserMedia 条目
    new_media = crud.create_user_media(
        db=db,
        user_id=current_user.id,
        media=schemas.UserMediaCreate(
            bangumi_id=bangumi_id,
            title=bangumi_data['name'],
            media_type=bangumi_data['type'],
            image=bangumi_data.get('images', {}).get('small', ''),
            summary=bangumi_data.get('summary', '')
        )
    )
    
    return new_media

@router.delete("/delete/{media_id}")
def delete_media(
    media_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return crud.delete_user_media(db=db, user_id=current_user.id, media_id=media_id)