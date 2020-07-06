from tethys_sdk.base import TethysAppBase, url_map_maker


class IndrhiHydroviewer(TethysAppBase):
    """
    Tethys app class for Indrhi Hydroviewer.
    """

    name = 'Indrhi Hydroviewer'
    index = 'indrhi_hydroviewer:home'
    icon = 'indrhi_hydroviewer/images/icon.gif'
    package = 'indrhi_hydroviewer'
    root_url = 'indrhi-hydroviewer'
    color = '#f39c12'
    description = 'This is a Hydroviewer for INDRHI'
    tags = '"Hydrology", "DR", "BYU", "Hydroviewer"'
    enable_feedback = False
    feedback_emails = []

    def url_maps(self):
        """
        Add controllers
        """
        UrlMap = url_map_maker(self.root_url)

        url_maps = (
            UrlMap(
                name='home',
                url='indrhi-hydroviewer',
                controller='indrhi_hydroviewer.controllers.home'
            ),
        )

        return url_maps