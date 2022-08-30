namespace Core.Storage;

public interface ILocalStorage
{
	ValueTask<FileStream> CreateFile(string destinationDirName, string fileName);
}

public class LocalStorage : ILocalStorage
{

	protected readonly string _rootDir;

	public LocalStorage(string rootDir) => _rootDir = rootDir;

	protected string RootDir => _rootDir;

	public async ValueTask<FileStream> CreateFile(string destinationDirName, string fileName)
	{
		await CreateDestinationDirIfNotExists(destinationDirName);

		var file = File.Create(Path.Combine(RootDir, destinationDirName, fileName));

		return file;

	}

	private ValueTask CreateDestinationDirIfNotExists(string destinationDirName)
	{
		var dir = new DirectoryInfo(Path.Combine(RootDir, destinationDirName));
		if (!dir.Exists)
			dir.Create();

		return ValueTask.CompletedTask;

	}
}
