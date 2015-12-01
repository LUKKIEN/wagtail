from wagtail.api.shared.utils import BadRequestError, page_models_from_string, filter_page_type
from wagtail.api.v2.endpoints import PagesAPIEndpoint, ImagesAPIEndpoint, DocumentsAPIEndpoint


class PagesAdminAPIEndpoint(PagesAPIEndpoint):
    pass


class ImagesAdminAPIEndpoint(ImagesAPIEndpoint):
    pass


class DocumentsAdminAPIEndpoint(DocumentsAPIEndpoint):
    pass
