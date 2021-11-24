from django.shortcuts import render
from tethys_sdk.gizmos import PlotlyView
from django.http import HttpResponse, JsonResponse

import pandas as pd
import io
import requests
import json
import ast
import csv
import numpy as np
import datetime as dt
import plotly.graph_objs as go
import scipy.stats as sp
from csv import writer as csv_writer
import geoglows
import gspread
from oauth2client.service_account import ServiceAccountCredentials
import pprint
from pydrive.auth import GoogleAuth
from pydrive.drive import GoogleDrive
from .app import IndrhiHydroviewer
import os
from tethys_sdk.workspaces import app_workspace




def home(request):
    """
    Controller for the app home page.
    """
    # googleDriveCSV()
    context = {}

    return render(request, 'indrhi_hydroviewer/home.html', context)

def googleDriveCSV():
    returnObject = {}
    #settings to create ##
    # the service email to share the file ##
    scope = ['https://spreadsheets.google.com/feeds','https://www.googleapis.com/auth/drive']

    creds = ServiceAccountCredentials.from_json_keyfile_name('INDRHI hydroviewer app-aaf90dedcad7.json', scope)
    client = gspread.authorize(creds)

    gauth = GoogleAuth()
    gauth.LoadCredentialsFile("mycreds.txt")
    if gauth.credentials is None:
        # Authenticate if they're not there
        gauth.LocalWebserverAuth()
    elif gauth.access_token_expired:
        # Refresh them if expired
        gauth.Refresh()
    else:
        # Initialize the saved creds
        gauth.Authorize()
    # Save the current credentials to a file
    gauth.SaveCredentialsFile("mycreds.txt")

    # gauth.LocalWebserverAuth() # Creates local webserver and auto handles authentication.
    drive = GoogleDrive(gauth)

    file1 = drive.CreateFile({'title': 'Hello.txt'})  # Create GoogleDriveFile instance with title 'Hello.txt'.
    file1.SetContentString('Hello World!') # Set content of the file from given string.
    file1.Upload()
    #The id of the folder should be a setting
    file_list = drive.ListFile({'q': "'1AsOO-nl6FcC8bMi72EhpOnjXFYZAjEA0' in parents and trashed=false"}).GetList()
    for file1 in file_list:
        if file1['title'] =="Maguaca":
            subFileID = file1['id']
            subFile = drive.ListFile({'q': "'{}' in parents and trashed=false".format(subFileID)}).GetList()
            for subfile1 in subFile:
                sheet = client.open('example').sheet1
                pp = pprint.PrettyPrinter()
                telemedicine = sheet.get_all_values()
                returnObject['obs']=telemedicine
                pp.pprint(telemedicine)

        # print('title: %s, id: %s' % (file1['title'], file1['id']))


    return returnObject

def get_available_dates(request):
    get_data = request.GET

    comid = get_data['comid']

    # request_params
    request_params = dict(watershed_name=watershed, subbasin_name=subbasin, reach_id=comid)

    # Token is for the demo account
    request_headers = dict(Authorization='Token 1adf07d983552705cd86ac681f3717510b6937f6')

    res = requests.get('https://tethys2.byu.edu/apps/streamflow-prediction-tool/api/GetAvailableDates/',
                       params=request_params, headers=request_headers)

    dates = []
    for date in eval(res.content):
        if len(date) == 10:
            date_mod = date + '000'
            date_f = dt.datetime.strptime(date_mod, '%Y%m%d.%H%M').strftime('%Y-%m-%d %H:%M')
        else:
            date_f = dt.datetime.strptime(date, '%Y%m%d.%H%M').strftime('%Y-%m-%d %H:%M')
        dates.append([date_f, date, watershed, subbasin, comid])

    dates.append(['Select Date', dates[-1][1]])
    dates.reverse()

    return JsonResponse({
        "success": "Data analysis complete!",
        "available_dates": json.dumps(dates)
    })


def get_time_series(request):
    get_data = request.GET
    try:
        comid = get_data['comid']
        stats = geoglows.streamflow.forecast_stats(comid)
        rperiods = geoglows.streamflow.return_periods(comid)
        return JsonResponse({'plot': geoglows.plots.forecast_stats(stats, rperiods, outformat='plotly_html')})
    except Exception as e:
        print(str(e))
        return JsonResponse({'error': 'No data found for the selected reach.'})


def get_return_periods(request):
    get_data = request.GET

    watershed = get_data['watershed']
    subbasin = get_data['subbasin']
    comid = get_data['comid']

    # request_params
    request_params = dict(watershed_name=watershed, subbasin_name=subbasin, reach_id=comid)

    # Token is for the demo account
    request_headers = dict(Authorization='Token 1adf07d983552705cd86ac681f3717510b6937f6')

    res = requests.get('https://tethys2.byu.edu/apps/streamflow-prediction-tool/api/GetReturnPeriods/',
                       params=request_params, headers=request_headers)

    return eval(res.content)


def get_return_period_ploty_info(request, datetime_start, datetime_end,band_alt_max=-9999):
    """
    Get shapes and annotations for plotly plot
    """

    # Return Period Section
    return_period_data = get_return_periods(request)
    return_max = float(return_period_data["max"])
    return_20 = float(return_period_data["twenty"])
    return_10 = float(return_period_data["ten"])
    return_2 = float(return_period_data["two"])

    # plotly info section
    shapes = [
        # return 20 band
        dict(
            type='rect',
            xref='x',
            yref='y',
            x0=datetime_start,
            y0=return_20,
            x1=datetime_end,
            y1=max(return_max, band_alt_max),
            line=dict(width=0),
            fillcolor='rgba(128, 0, 128, 0.4)',
        ),
        # return 10 band
        dict(
            type='rect',
            xref='x',
            yref='y',
            x0=datetime_start,
            y0=return_10,
            x1=datetime_end,
            y1=return_20,
            line=dict(width=0),
            fillcolor='rgba(255, 0, 0, 0.4)',
        ),
        # return 2 band
        dict(
            type='rect',
            xref='x',
            yref='y',
            x0=datetime_start,
            y0=return_2,
            x1=datetime_end,
            y1=return_10,
            line=dict(width=0),
            fillcolor='rgba(255, 255, 0, 0.4)',
        ),
    ]
    annotations = [
        # return max
        dict(
            x=datetime_end,
            y=return_max,
            xref='x',
            yref='y',
            text='Max. ({:.1f})'.format(return_max),
            showarrow=False,
            xanchor='left',
        ),
        # return 20 band
        dict(
            x=datetime_end,
            y=return_20,
            xref='x',
            yref='y',
            text='20-yr ({:.1f})'.format(return_20),
            showarrow=False,
            xanchor='left',
        ),
        # return 10 band
        dict(
            x=datetime_end,
            y=return_10,
            xref='x',
            yref='y',
            text='10-yr ({:.1f})'.format(return_10),
            showarrow=False,
            xanchor='left',
        ),
        # return 2 band
        dict(
            x=datetime_end,
            y=return_2,
            xref='x',
            yref='y',
            text='2-yr ({:.1f})'.format(return_2),
            showarrow=False,
            xanchor='left',
        ),
    ]

    return shapes, annotations


def get_units_title(unit_type):
    """
    Get the title for units
    """
    units_title = "m"
    if unit_type == 'english':
        units_title = "ft"
    return units_title


def forecastpercent(request):
    # Check if its an ajax post request
    if request.is_ajax() and request.method == 'GET':
        comid = request.GET.get('comid')
        stats = geoglows.streamflow.forecast_stats(comid)
        ensems = geoglows.streamflow.forecast_ensembles(comid)
        rperiods = geoglows.streamflow.return_periods(comid)
        return JsonResponse({'table': geoglows.plots.probabilities_table(stats, ensems, rperiods)})


def get_historic_data(request):
    """""
    Returns ERA Interim hydrograph
    """""

    get_data = request.GET

    try:
        comid = get_data['comid']
        hist = geoglows.streamflow.historic_simulation(comid)
        rperiods = geoglows.streamflow.return_periods(comid)
        return JsonResponse({'plot': geoglows.plots.historic_simulation(hist, rperiods, outformat='plotly_html')})

    except Exception as e:
        print(str(e))
        return JsonResponse({'error': 'No historic data found for the selected reach.'})


def get_flow_duration_curve(request):
    get_data = request.GET

    try:
        comid = get_data['comid']
        hist = geoglows.streamflow.historic_simulation(comid)
        return JsonResponse({'plot': geoglows.plots.flow_duration_curve(hist, outformat='plotly_html')})

    except Exception as e:
        print(str(e))
        return JsonResponse({'error': 'No historic data found for calculating flow duration curve.'})


def get_dailyAverages(request):
    """
    Get historic simulations from ERA Interim
    """
    get_data = request.GET

    try:
        comid = get_data['comid']
        day = geoglows.streamflow.daily_averages(comid)
        return JsonResponse({'plot': geoglows.plots.daily_averages(day, outformat='plotly_html')})

    except Exception as e:
        print(str(e))
        return JsonResponse({'error': 'No data found for the selected station.'})


def get_monthlyAverages(request):
    """
    Get historic simulations from ERA Interim
    """
    get_data = request.GET

    try:
        comid = get_data['comid']
        month = geoglows.streamflow.monthly_averages(comid)
        return JsonResponse({'plot': geoglows.plots.daily_averages(month, outformat='plotly_html')})

    except Exception as e:
        print(str(e))
        return JsonResponse({'error': 'No data found for the selected station.'})


def get_historic_data_csv(request):
    """
    Get historic simulations from ERA Interim
    """

    try:
        get_data = request.GET
        watershed = get_data['watershed']
        subbasin = get_data['subbasin']
        comid = get_data['comid']

        era_res2 = geoglows.streamflow.historic_simulation(comid)
        era_res = era_res2.to_csv()

        era_pairs = era_res.splitlines()
        era_pairs.pop(0)

        era_dates = []
        era_values = []

        for era_pair in era_pairs:
            # era_pair = era_pair.decode('utf-8')
            era_dates.append(dt.datetime.strptime(era_pair.split(',')[0].split('+')[0], '%Y-%m-%d %H:%M:%S'))
            era_values.append(float(era_pair.split(',')[1]))

        pairs = [list(a) for a in zip(era_dates, era_values)]

        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename=historic_streamflow_{0}.csv'.format(comid)

        writer = csv_writer(response)
        writer.writerow(['datetime', 'flow (m3/s)'])

        for row_data in pairs:
            writer.writerow(row_data)

        return response

    except Exception as e:
        print(str(e))
        return JsonResponse({'error': 'An unknown error occurred while retrieving the Discharge Data.'})


def get_forecast_data_csv(request):
    """""
    Returns Forecast data as csv
    """""

    get_data = request.GET

    try:
        watershed = get_data['watershed_name']
        subbasin = get_data['subbasin_name']
        comid = get_data['comid']
        stats = geoglows.streamflow.forecast_stats(comid)
        columns_df_final = ['datetime']
        columns_df = list(stats)
        columns_af = columns_df_final + columns_df
        qout_data2 = stats.to_csv()
        qout_data = qout_data2.splitlines()

        qout_data.pop(0)

        init_time = qout_data[0].split(',')[0].split('+')[0]
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename=streamflow_forecast_{0}_{1}_{2}_{3}.csv'.format(
            watershed,
            subbasin,
            comid,
            init_time)

        writer = csv_writer(response)
        writer.writerow(columns_af)

        for row_data in qout_data:
            writer.writerow(row_data.split(','))

        return response

    except Exception as e:
        print(str(e))
        return JsonResponse({'error': 'No forecast data found.'})

def retrieve_model_helper(station_id,watershed_name):
    if station_id == 'R. JIMENOA-JARACOBA':
        station_id = 'R. JIMENOA-JARABACOA'
    if station_id == 'JARACOBA':
        station_id = 'JARABACOA'
    MODELS = [
        "FFGS-ARW",
        "FFGS-FV3",
        "Sispi-RAIN",
        "MF-AROME"
    ]
    return_obj = {}
    try:
        first_time = True
        for model_single in MODELS:
            URL="https://sipif.indrhi.gob.do/hidro/mhh/"+ watershed_name +"/Arch/" + model_single +  ".csv"
            headers = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36'}
            response = requests.get(URL, headers=headers)
            file_object = io.StringIO(response.content.decode('utf-8'))
            df = pd.read_csv(file_object, skiprows=[0,1]).reset_index(drop=True)
            rows_qu = df.shape[0]
            col_qu = df.shape[1]
            # print(df.columns)
            # print(station_id)
            values = df[station_id].iloc[3:rows_qu].tolist()
            if first_time is True:
                timestamps = df["Nombre/ID:"].iloc[3:rows_qu].tolist()
                return_obj['timestamps'] = timestamps
                first_time = False

            return_obj[model_single] = values
            # print(values)
            # print(timestamps)
        return return_obj
    except Exception as e:
        print("THE ERROR",e)
        # return_obj['error'] = f'{e}'
        return_obj['error'] = 'Probably the endpoind has changed'

        return return_obj

def retrieve_models(request):

    return_obj = {}
    try:
        stationID = request.GET['id']
        idNew = stationID.encode('latin1').decode('utf8')
        idNew  = idNew.upper()
        return_obj = retrieve_model_helper(idNew, "YaqueNorte")
    except Exception as e:
        print(e)
    # print(return_obj)
    return JsonResponse(return_obj)
def retrieve_models_in(request):

    return_obj = {}
    try:
        stationID = request.GET['id']
        idNew = stationID.encode('latin1').decode('utf8')
        idNew  = idNew.upper()
        return_obj = retrieve_models_helper_in(idNew, "YaqueNorte")
    except Exception as e:
        print(e)
    return JsonResponse(return_obj)

def retrieve_models_helper_in(station_id, watershed_name):
    if station_id == 'R. JIMENOA-JARACOBA':
        station_id = 'R. JIMENOA-JARABACOA'
    if station_id == 'JARACOBA':
        station_id = 'JARABACOA'
    conversor_dict = {
    'CASTAÑUELAS':'S-CASTAÑUELAS',
    'R. GUAYUBÍN - YAQUE DEL NORTE':'S-R. GUAYUBÍN - YAQUE DEL NORTE',
    'EH. PEÑA RANCHADERO':'S-EH. PEÑA RANCHADERO',
    'R. YAQUE - CANA':'S-R. YAQUE - CANA',
    'R. CANA - R. YAQUE DEL NORTE':'S-R. CANA - R. YAQUE DEL NORTE',
    'E. CHACUEY':'S-E. CHACUEY',
    'EH. PUENTE SAN RAFAEL': 'S-EH. PUENTE SAN RAFAEL',
    'E. MAGUACA':'S-E. MAGUACA',
    'R. GUAYUBÍN - AMINILLA':'S-R. GUAYUBÍN - AMINILLA',
    'R. AMINILLA - R. YANUBÍN': 'S-R. AMINILLA - R. YANUBÍN',
    'R. AMINA - R. YAQUE DEL NORTE':'S-R. AMINA - R. YAQUE DEL NORTE',
    'EH. SABANETA':'S-EH. SABANETA',
    'MAO':'S-MAO',
    'R. YAGUAJAL - R. GUAYUBÍN': 'S-R. YAGUAJAL - R. GUAYUBÍN',
    'JAIBÓN':'S-JAIBÓN',
    'E. MONCIÓN':'S-E. MONCIÓN',
    'SANTIAGO DE LOS CABALLEROS':'S-SANTIAGO DE LOS CABALLEROS',
    'E. LÓPEZ ANGOSTURA': 'S-E. LÓPEZ ANGOSTURA',
    'R. MAGUA - E. MAO': 'S-R. MAGUA - E. MAO',
    'E. MAO':'S-E. MAO',
    'E. BAO':'S-E. BAO',
    'E. TAVERA': 'S-E. TAVERA',
    'R. GUANAJUMA - E. BAO': 'S-R. GUANAJUMA - E. BAO',
    'EH. INOA': 'S-EH. INOA',
    'EH BOMA':'S-EH BOMA',
    'R. MAO - CENOVI':'S-R. MAO - CENOVI',
    'EH LOS PILONES':'S-EH LOS PILONES',
    'R. CENOVI - R. MAO': 'S-R. CENOVI - R. MAO',
    'EH EL HIGUERO':'S-EH EL HIGUERO',
    'JARABACOA':'S-JARABACOA',
    'R. JIMENOA-JARABACOA':'S-R. JIMENOA-JARABACOA',
    'EH. EL CERRAZO':'S-EH. EL CERRAZO',
    'EH. MATA GRANDE':'S-EH. MATA GRANDE',
    'EH. LA FORTALEZA':'S-EH. LA FORTALEZA'
    }
    MODELS = [
        "FFGS-ARW",
        "FFGS-FV3",
        "Sispi-RAIN",
        "MF-AROME"
    ]
    return_obj = {}

    try:
        first_time = True
        for model_single in MODELS:
            URL="http://sipif.indrhi.gob.do/hidro/mhh/"+ watershed_name +"/Arch/" + model_single+"_in" + ".csv"
            headers = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36'}
            response = requests.get(URL, headers=headers)
            file_object = io.StringIO(response.content.decode('utf-8'))
            df = pd.read_csv(file_object, skiprows=[0,1]).reset_index(drop=True)
            rows_qu = df.shape[0]
            col_qu = df.shape[1]
            # print(df.columns)
            # if station_id in conversor_dict:
            #     print("yeahjhhhh")
            new_in_station_id = conversor_dict[station_id]
            values = df[new_in_station_id].iloc[3:rows_qu].tolist()
            if first_time is True:
                timestamps = df["Nombre/ID:"].iloc[3:rows_qu].tolist()
                return_obj['timestamps'] = timestamps
                first_time = False
            return_obj[model_single] = values
            # print(timestamps)
        # print(df)
        # print(return_obj)
        return return_obj
    except Exception as e:
        print("THE ERROR",e)
        return_obj['error'] = 'Probably the endpoind has changed'
        return return_obj
