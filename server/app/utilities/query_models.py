from enum import Enum


class SortOrder(str, Enum):
    desc = "desc"
    asc = "asc"


class SortBy(str, Enum):
    title = "title"
    date = "date"
