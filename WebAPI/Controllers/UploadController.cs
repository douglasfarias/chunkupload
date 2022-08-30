using Core.Storage;
using Core.ValueObjects;

using Microsoft.AspNetCore.Mvc;

namespace WebAPI.Controllers;

[Route("/api/upload")]
public class UploadController : Controller
{
	[HttpPost]
	public async ValueTask<IActionResult> Upload([FromServices] ILocalStorage localStorage, [FromHeader(Name = "Content-Range")] string contentRangeString, IFormFile chunk)
	{
		var contentRange = ContentRange.CreateInstance(contentRangeString);
		var fileNameWithoutExtension = Path.GetFileNameWithoutExtension(chunk.FileName);
		var fileName = GetFileName(chunk, contentRange!, fileNameWithoutExtension);
		await SaveFileInStorage(localStorage, chunk, fileNameWithoutExtension, fileName);

		return Ok();
	}

	[NonAction]
	static async Task SaveFileInStorage(ILocalStorage localStorage, IFormFile file, string fileNameWithoutExtension, string fileName)
	{
		var fileStream = await localStorage.CreateFile(fileNameWithoutExtension, fileName);
		await file.CopyToAsync(fileStream);
	}

	[NonAction]
	static string GetFileName(IFormFile file, IContentRange contentRange, string fileNameWithoutExtension)
	{
		var extension = Path.GetExtension(file.FileName);
		var fileName = string.Concat(fileNameWithoutExtension, "_", contentRange!.FirsByte, "-", contentRange!.LastByte, "-", contentRange!.TotalBytes, extension);
		return fileName;
	}
}
