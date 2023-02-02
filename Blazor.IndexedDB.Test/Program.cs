
using System.Threading.Tasks;
using Microsoft.AspNetCore.Components.WebAssembly.Hosting;

namespace Blazor.IndexedDB.Test
{
    public class Program
    {
        public static async Task Main(string[] args)
        {
            var builder = WebAssemblyHostBuilder.CreateDefault(args);
            var startup = new Startup();

            startup.Configure(builder);
            startup.ConfigureServices(builder.Services);

            await builder.Build().RunAsync();
        }
    }
}
