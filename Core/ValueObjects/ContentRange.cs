using System.Text.RegularExpressions;

namespace Core.ValueObjects;

public interface IContentRange
{
    long FirsByte { get; set; }
    long LastByte { get; set; }
    long TotalBytes { get; set; }
}

public class ContentRange : IContentRange
{
    private ContentRange(long firsByte, long lastByte, long totalBytes)
    {
        FirsByte = firsByte;
        LastByte = lastByte;
        TotalBytes = totalBytes;
    }

    public static IContentRange CreateInstance(long firsByte, long lastByte, long totalBytes)
    {
        var contentRange = new ContentRange(firsByte, lastByte, totalBytes);

        return contentRange;

    }
    public static IContentRange? CreateInstance(string contentRangeString)
    {
        EnsureStringIsNotNullEmptyOrWhitespace(contentRangeString);

        var matches = FindMatches(contentRangeString);

        var firstByte = GetFirstByteFromString(matches);
        var lastByte = GetLastByteFromString(matches);
        var totalBytes = GetTotalBytesFromString(matches);

        var contentRange = CreateInstance(
            firstByte,
            lastByte,
            totalBytes
            );

        return contentRange;

    }

    private static void EnsureStringIsNotNullEmptyOrWhitespace(string contentRangeString)
    {
        if(string.IsNullOrEmpty(contentRangeString) || string.IsNullOrWhiteSpace(contentRangeString))
            throw new ArgumentException("The Content-Range header could not be null or empty!");
    }

    private static MatchCollection FindMatches(string contentRangeString)
    {
        var regex = new Regex(@"\d+");
        var matches = regex.Matches(contentRangeString);

        return matches;

    }

    private static long GetTotalBytesFromString(MatchCollection matches)
    {
        var totalBytes = long.Parse(matches[2].Value);
        if(totalBytes.Equals(null))
            throw new ArgumentNullException(nameof(TotalBytes), "Could not be null!");
        
        return totalBytes;

    }

    private static long GetLastByteFromString(MatchCollection matches)
    {
        var lastByte = long.Parse(matches[1].Value);
        if(lastByte.Equals(null))
            throw new ArgumentNullException(nameof(LastByte), "Could not be null!");
        
        return lastByte;

    }

    private static long GetFirstByteFromString(MatchCollection matches)
    {
        var firstByte = long.Parse(matches[0].Value);
        if(firstByte.Equals(null))
            throw new ArgumentNullException(nameof(FirsByte), "Could not be null!");
        
        return firstByte;

    }

    public long FirsByte { get; set; }
    public long LastByte { get; set; }
    public long TotalBytes { get; set; }

    public override string ToString()
        => $"bytes {FirsByte}-{LastByte}/{TotalBytes}";
}
