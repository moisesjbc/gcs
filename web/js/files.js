/***
 * Copyright 2012, 2014
 * Garoe Dorta Perez
 * Moises J. Bonilla Caraballo (Neodivert)
 *
 * This file is part of GCS.
 *
 * GCS is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * any later version.
 *
 * GCS is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with GCS.  If not, see <http://www.gnu.org/licenses/>.
***/

/*
	Set JQuery-UI objects related to files:
		- New file dialog.
*/
function InitFilesJQuery()
{  
	$(function () {
		$('#newFileDialog').dialog({
			autoOpen: false,
			modal: true,
			title: '???',
			//title: projectName + ' - Crear nuevo fichero',
			buttons: [
				{text: "Submit", click: function() { 
					var fileName = $("#newFileInput").val();

					if( !fileName.length ){
						alert( 'ERROR: Nombre de fichero vacio' );
						return;
					}else if( fileName.indexOf(' ') != -1  ){
						alert( 'ERROR: El nombre del fichero no puede contener espacios' );
						return;
					}

					// The function wich opens this dialog changes its title to
					// projectName + ' - Crear Fichero'. So we can take 
					// projectName from title.
					var projectName = $(this).dialog('option', 'title');
					projectName = (projectName.split('-'))[0].trim();

					fileName = projectName + '/' + $("#newFileInput").val();
					if( document.getElementById( fileName ) ){
						alert( 'ERROR: Ya existe otro fichero con el mismo nombre' );
					}else{
						CreateFile( fileName );
						$(this).dialog( 'close' );
					}
				}},

				{text: "Cancel", click: function() {
					$(this).dialog( 'close' );
				}}
			]
		});
		return false;
	});
}


/*
	Create a JQuery-UI dialog for creating new files. The new file will be
	append to list 'projectName'.
*/
function OpenNewFileDialog( projectName ){
	// Change dialog's title to projectName + ' - Crear nuevo fichero'.
	$('#newFileDialog').dialog( 'option', 'title', projectName + ' - Crear nuevo fichero' );

	// Clear the file name input.
	$("#newFileInput").val('');

	// Open dialog.
	$('#newFileDialog').dialog( 'open' );
}


/*
	OpenFile - Send AJAX request for opening file 'fileName'.
*/
function OpenFile( fileName )
{	
	if( $('#fileTabs-'+hex_md5( fileName ) ).length ){
		alert( 'El fichero ya est\u00e1 abierto!' );
		return;
	}
	var parameters = 'fileName='+fileName+'&fileAction=openFile';

	var responseFunction = function(){
  		if ( xmlhttp.readyState==4 && xmlhttp.status==200 ){
			// We use md5 resume function in order to get a ASCII unique id
			// for open files tabs.
			var divId = 'fileTabs-' + hex_md5( fileName );

			// Create a new tab for new open file.
			var openFilesTabs = document.getElementById('fileTabs');
			CreateDiv( openFilesTabs, divId, xmlhttp.responseText );
			$('#fileTabs').tabs('add','#' + divId, fileName );
		}
	}
	
	SendPOSTRequest( request_url, parameters, responseFunction );
}


/*
	Close - Send AJAX request for closing file 'fileName'.
*/
function CloseFile( fileName )
{	
	var parameters = "fileName="+fileName+"&fileAction=closeFile";
	
	var responseFunction = function(){
  		if ( xmlhttp.readyState==4 && xmlhttp.status==200 ){
			// Remove the open file's tab.
			var divId = 'fileTabs-' + hex_md5( fileName );
			$('#fileTabs').tabs('remove','#' + divId );
		}
	}
	
	SendPOSTRequest( request_url, parameters, responseFunction );
}


/*
	AppendFileListItem - Create a list entry for file 'fileName' and append it
	to list 'parentList'
*/
function AppendFileListItem( fileName, parentList )
{
	// Create list element with id=fileName
	var newListItem = document.createElement( 'li' );
	newListItem.setAttribute( 'id', fileName );

	// Create link for opening file and append it to list element.
	var newLink = document.createElement( 'a' );
	newLink.setAttribute( 'href', '#' );
	newLink.setAttribute( 'onClick', "OpenFile('" + fileName + "' );return false;" );
	newLink.innerHTML = fileName + ' ';
	newListItem.appendChild( newLink );
	
	// Create link for deleting file and append it to list element.
	var newLink2 = document.createElement( 'a' );
	newLink2.setAttribute( 'href', '#' );
	newLink2.setAttribute( 'onClick', "DeleteFile('" + fileName + "' );return false;" );
	newLink2.innerHTML = '[Eliminar]';
	newListItem.appendChild( newLink2 );

	// Append list item to list. 
	parentList.appendChild( newListItem );
}


/*
	CreateFile - Send AJAX request for creating file 'fileName'.
*/
function CreateFile( fileName )
{
	var parameters = "fileName="+fileName+"&fileAction=createFile";
	
	var responseFunction = function(){
  		if ( xmlhttp.readyState==4 && xmlhttp.status==200 ){
			aux = fileName;
			var projectName = aux.split('/')[0];

			AppendFileListItem( fileName, document.getElementById( projectName + '@filesList' ) );
		}
	}
	
	SendPOSTRequest( request_url, parameters, responseFunction );
}


/*
	DeleteFile - Send AJAX request for deleting file 'fileName'.
*/
function DeleteFile( fileName )
{
	// Ask for confirmation.
	var r = confirm( '¿Esta seguro de querer eliminar el fichero [' + fileName + ']?' );
	if( r==false ){
		return;
	}

	var parameters = "fileName="+fileName+"&fileAction=deleteFile";
	
	var responseFunction = function(){
  		if ( xmlhttp.readyState==4 && xmlhttp.status==200 ){
			RemoveElement( fileName );

			// If file is open, remove its tab.
			var divId = '#fileTabs-' + hex_md5( fileName );
			if( $( divId ).length ){
				$('#fileTabs').tabs('remove', divId );
			}
		}
	}
	
	SendPOSTRequest( request_url, parameters, responseFunction );
}


/*
	SaveFile - Send AJAX request for saving file 'fileName'.
*/
function SaveFile( fileName, textAreaId )
{
	var textArea = document.getElementById( textAreaId );
	var parameters = "fileName="+fileName+"&fileAction=saveFile&fileContent="+textArea.value;
	
	var responseFunction = function(){
  		if ( xmlhttp.readyState==4 && xmlhttp.status==200 ){
			textArea.innerText = xmlhttp.responseText;
		}
	}
	
	SendPOSTRequest( request_url, parameters, responseFunction );
}
