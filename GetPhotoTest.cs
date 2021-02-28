using Bogus;
using System;
using System.Net;
using System.Threading;

namespace PhotoGetter
{
	class Program
	{
		const string url = "https://thispersondoesnotexist.com/image";
		static void Main(string[] args)
		{
			for (int i = 0; i < 1000; i++)
			{
				var faker = new Faker("ru");
				var name = faker.Name.FullName();
				using (WebClient client = new WebClient())
					client.DownloadFile(new Uri(url), @"C:\Users\maxim\source\repos\PhotoGetter\photos\" + name + ".jpg");
				Console.WriteLine(name);
				Thread.Sleep(2000);
			}
		}
	}
}