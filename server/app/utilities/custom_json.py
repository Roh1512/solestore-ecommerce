from bson import ObjectId
from fastapi.encoders import jsonable_encoder
from beanie.odm.fields import PydanticObjectId


class CustomJSONEncoder:
    @staticmethod
    def default(obj):
        if isinstance(obj, (ObjectId, PydanticObjectId)):
            return str(obj)
        return jsonable_encoder(obj)
