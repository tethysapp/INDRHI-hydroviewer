from setuptools import setup, find_namespace_packages
from setup_helper import find_resource_files

# -- Apps Definition -- #
app_package = 'indrhi_hydroviewer'
release_package = 'tethysapp-' + app_package

# -- Python Dependencies -- #
dependencies = []

# -- Get Resource File -- #
resource_files = find_resource_files('tethysapp/' + app_package + '/templates', 'tethysapp/' + app_package)
resource_files += find_resource_files('tethysapp/' + app_package + '/public', 'tethysapp/' + app_package)
resource_files += find_resource_files('tethysapp/' + app_package + '/workspaces', 'tethysapp/' + app_package)


resource_files += find_resource_files('tethysapp/' + app_package + '/scripts', 'tethysapp/' + app_package)
setup(
    name=release_package,
    version='1.1',
    description='This is a Hydroviewer for INDRHI',
    long_description='',
    keywords='',
    author='Giovanni Romero',
    author_email='gio.rombus@gmail.com',
    url='',
    license='MIT',
    packages=find_namespace_packages(),
    package_data={'': resource_files},
    include_package_data=True,
    zip_safe=False,
    install_requires=dependencies,
)
