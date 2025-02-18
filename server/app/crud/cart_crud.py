'''Cart Crud functions'''

from asyncio import gather

from bson import ObjectId
from app.model.cart_models import CartResponse, ProductInCart, CartItemResponse
from app.model.user import User
from app.model.product_models import Product
from fastapi import HTTPException
from beanie import PydanticObjectId
from beanie.operators import And


async def get_cart_items(
        user_id: str,
        page: int = 1,
        search: str = None
) -> CartResponse:
    '''Function to get items in cart for the user'''
    limit = 20
    skip = (page - 1) * limit
    try:
        if not ObjectId.is_valid(user_id):
            raise HTTPException(
                status_code=400,
                detail="Invalid user ID"
            )
        user = await User.get(PydanticObjectId(user_id))
        if not user:
            raise HTTPException(
                status_code=404,
                detail="User not found"
            )

        conditions = [ProductInCart.user_id == PydanticObjectId(user_id)]
        if search:
            conditions.append(ProductInCart.title.regex(search, "i"))

        query = {"user_id": PydanticObjectId(user_id)}
        # Use an aggregation pipeline to compute the total price.
        pipeline = [
            {"$match": query},
            {
                "$group": {
                    "_id": None,
                    "totalPrice": {"$sum": {"$multiply": ["$price", "$quantity"]}},
                    "totalCount": {"$sum": "$quantity"}
                }
            }
        ]
        agg_result, cart_items = await gather(
            ProductInCart.aggregate(pipeline).to_list(),
            ProductInCart.find(
                And(*conditions)
            ).sort(("created_at", -1)).skip(skip).limit(limit).to_list()
        )
        total_price = agg_result[0]["totalPrice"] if agg_result else 0.0
        total_count = agg_result[0]["totalCount"] if agg_result else 0

        cart_items_response = [
            CartItemResponse.from_mongo(item) for item in cart_items]
        return CartResponse(
            items=cart_items_response,
            total_price=round(total_price, 2),
            total_count=total_count)

    except HTTPException as e:
        print("Error creating cart: ", e)
        raise HTTPException(
            status_code=e.status_code,
            detail=e.detail
        ) from e


async def add_to_cart(
        user_id: str,
        product_id: str,
        size: str,
        quantity: str
) -> CartItemResponse:
    '''Function to add item to cart'''
    try:
        if not ObjectId.is_valid(user_id):
            raise HTTPException(
                status_code=400,
                detail="Invalid user ID"
            )
        if not ObjectId.is_valid(product_id):
            raise HTTPException(
                status_code=400,
                detail="Invalid product ID"
            )

        user, product = await gather(
            User.get(PydanticObjectId(user_id)),
            Product.get(PydanticObjectId(product_id))
        )
        if not user:
            raise HTTPException(
                status_code=404,
                detail="User not found"
            )
        if not product:
            raise HTTPException(
                status_code=404,
                detail="Product not found"
            )

        try:
            requested_size = int(size)
            requested_qty = int(quantity)
        except ValueError as e:
            raise HTTPException(
                status_code=400,
                detail="Size and quantity must be integers"
            ) from e

        # Find the matching size entry in the product's sizes list
        matching_size = next(
            (s for s in product.sizes if s.size == requested_size),
            None
        )
        if not matching_size:
            raise HTTPException(
                status_code=400,
                detail=f"Size {size} is not available for this product"
            )

        if matching_size.stock < requested_qty:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock: available stock for size {requested_size} is {matching_size.stock}"
            )

        product_in_cart = await ProductInCart.find_one(
            And(
                ProductInCart.product_id == PydanticObjectId(product_id),
                ProductInCart.user_id == PydanticObjectId(user_id),
                ProductInCart.size == size
            )
        )

        if product_in_cart:
            new_quantity = product_in_cart.quantity + requested_qty
            if new_quantity > matching_size.stock:
                raise HTTPException(
                    status_code=400,
                    detail=f"Insufficient stock to add {requested_qty} more. "
                    f"Available additional stock: {matching_size.stock - product_in_cart.quantity}"
                )
            product_in_cart.quantity = new_quantity
            await product_in_cart.save()
            return CartItemResponse.from_mongo(product_in_cart)
        # Create a new cart item.
        new_cart_item = ProductInCart(
            user_id=PydanticObjectId(user_id),
            product_id=PydanticObjectId(product_id),
            title=product.title,
            price=product.price,
            size=requested_size,
            quantity=requested_qty,
            image_url=product.images[0].url if product.images else None
        )
        await new_cart_item.insert()
        return CartItemResponse.from_mongo(new_cart_item)

    except HTTPException as e:
        print("Error adding to cart: ", e)
        raise HTTPException(
            status_code=e.status_code,
            detail=e.detail
        ) from e


async def remove_item_from_cart(
        user_id: str,
        cart_id: str
) -> CartItemResponse:
    '''Function to remove item from cart'''
    try:
        if not ObjectId.is_valid(user_id):
            raise HTTPException(
                status_code=400,
                detail="Invalid user ID"
            )
        if not ObjectId.is_valid(cart_id):
            raise HTTPException(
                status_code=400,
                detail="Invalid cart Id"
            )
        user, product_in_cart = await gather(
            User.get(PydanticObjectId(user_id)),
            ProductInCart.get(PydanticObjectId(cart_id))
        )
        if not user:
            raise HTTPException(
                status_code=404,
                detail="User not found"
            )
        if not product_in_cart:
            raise HTTPException(
                status_code=404,
                detail="Product not in cart"
            )
        if str(product_in_cart.user_id) != str(user_id):
            raise HTTPException(
                status_code=400,
                detail="This is not your cart"
            )
        cart_item_data = CartItemResponse.from_mongo(product_in_cart)
        await product_in_cart.delete()
        return cart_item_data

    except HTTPException as e:
        print(f"Error removing item from cart: {e}")
        raise HTTPException(
            status_code=e.status_code,
            detail=e.detail
        ) from e


async def change_item_quantity(
        user_id: str,
        cart_id: str,
        product_id: str,
        size: int,
        quantity: int
):
    '''Function to change quantity of item in cart'''
    try:
        if not ObjectId.is_valid(user_id):
            raise HTTPException(
                status_code=400,
                detail="Invalid user ID"
            )
        if not ObjectId.is_valid(cart_id):
            raise HTTPException(
                status_code=400,
                detail="Invalid cart Id"
            )
        if not ObjectId.is_valid(product_id):
            raise HTTPException(
                status_code=400,
                detail="Invalid product Id"
            )

        user, cart_item, product = await gather(
            User.get(PydanticObjectId(user_id)),
            ProductInCart.get(PydanticObjectId(cart_id)),
            Product.get(PydanticObjectId(product_id))
        )
        if not user:
            raise HTTPException(
                status_code=404,
                detail="User not found"
            )
        if not cart_item:
            raise HTTPException(
                status_code=404,
                detail="Product not in cart"
            )
        if not product:
            raise HTTPException(
                status_code=404,
                detail="Product not found"
            )
        if str(cart_item.user_id) != str(user_id):
            raise HTTPException(
                status_code=400,
                detail="This is not your cart"
            )
        if str(cart_item.product_id) != str(product_id):
            raise HTTPException(
                status_code=400,
                detail="This is not the product you want to change the quantity for"
            )
        matching_size = next(
            (s for s in product.sizes if s.size == size),
            None
        )
        if not matching_size:
            raise HTTPException(
                status_code=400,
                detail=f"Size {size} is not available for this product"
            )
        if size != cart_item.size:
            raise HTTPException(
                status_code=400,
                detail=f"Given size {matching_size.size} is not the selected size"
            )

        new_quantity = cart_item.quantity + quantity
        if new_quantity > matching_size.stock:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock to add {quantity} more. Available additional stock: {matching_size.stock - cart_item.quantity}"
            )
        if new_quantity < 0:
            raise HTTPException(
                status_code=400,
                detail=f"You have only {matching_size.stock} pieces in cart"
            )
        cart_item.quantity = new_quantity
        await cart_item.save()
        return CartItemResponse.from_mongo(cart_item)
    except HTTPException as e:
        print(f"Error changing quatity of item in cart: {e}")
        raise HTTPException(
            status_code=e.status_code,
            detail=e.detail
        ) from e
