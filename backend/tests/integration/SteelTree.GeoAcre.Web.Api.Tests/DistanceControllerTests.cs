using Microsoft.VisualStudio.TestTools.UnitTesting;
using SteelTree.GeoAcre.Web.Api.Models;
using System.Net;
using System.Net.Http.Json;

namespace SteelTree.GeoAcre.Web.Api.Tests
{
    [TestClass]
    public class DistanceControllerTests : ApiTestBase
    {
        [TestMethod]
        public async Task PostCalculateDistance_WithValidPolyline_ReturnsOkWithDistance()
        {
            // Arrange
            var request = new CalculateDistanceRequest
            {
                Vertices = new[]
                {
                    new LatLngDto { Latitude = 40.7128, Longitude = -74.006 }, // NYC
                    new LatLngDto { Latitude = 34.0522, Longitude = -118.2437 }, // LA
                }
            };

            // Act
            var response = await Client.PostAsJsonAsync("api/geometry/calculate-distance", request);
            var content = await response.Content.ReadAsAsync<CalculateDistanceResponse>();

            // Assert
            Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);
            Assert.IsNotNull(content);
            Assert.IsTrue(content.TotalDistanceMeters > 0);
            Assert.AreEqual(1, content.PerSegmentDistancesMeters.Length);
            // NYC to LA: approximately 3944 km
            Assert.IsTrue(content.TotalDistanceMeters > 3900000);
            Assert.IsTrue(content.TotalDistanceMeters < 3990000);
        }

        [TestMethod]
        public async Task PostCalculateDistance_WithMultipleSegments_ReturnsCorrectSegments()
        {
            // Arrange
            var request = new CalculateDistanceRequest
            {
                Vertices = new[]
                {
                    new LatLngDto { Latitude = 40.7128, Longitude = -74.006 }, // NYC
                    new LatLngDto { Latitude = 34.0522, Longitude = -118.2437 }, // LA
                    new LatLngDto { Latitude = 41.8781, Longitude = -87.6298 }, // Chicago
                }
            };

            // Act
            var response = await Client.PostAsJsonAsync("api/geometry/calculate-distance", request);
            var content = await response.Content.ReadAsAsync<CalculateDistanceResponse>();

            // Assert
            Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);
            Assert.IsNotNull(content);
            Assert.AreEqual(2, content.PerSegmentDistancesMeters.Length);
            Assert.IsTrue(content.TotalDistanceMeters > 0);
            
            // Total should be sum of segments (within tolerance)
            var segmentSum = content.PerSegmentDistancesMeters.Sum();
            Assert.IsTrue(Math.Abs(content.TotalDistanceMeters - segmentSum) < 1000); // 1km tolerance
        }

        [TestMethod]
        public async Task PostCalculateDistance_WithInsufficientVertices_ReturnsBadRequest()
        {
            // Arrange
            var request = new CalculateDistanceRequest
            {
                Vertices = new[]
                {
                    new LatLngDto { Latitude = 40.7128, Longitude = -74.006 },
                }
            };

            // Act
            var response = await Client.PostAsJsonAsync("api/geometry/calculate-distance", request);

            // Assert
            Assert.AreEqual(HttpStatusCode.BadRequest, response.StatusCode);
        }

        [TestMethod]
        public async Task PostCalculateDistance_WithInvalidCoordinates_ReturnsBadRequest()
        {
            // Arrange
            var request = new CalculateDistanceRequest
            {
                Vertices = new[]
                {
                    new LatLngDto { Latitude = 40.7128, Longitude = -74.006 },
                    new LatLngDto { Latitude = 95.0, Longitude = -118.2437 }, // Invalid latitude
                }
            };

            // Act
            var response = await Client.PostAsJsonAsync("api/geometry/calculate-distance", request);

            // Assert
            Assert.AreEqual(HttpStatusCode.BadRequest, response.StatusCode);
        }

        [TestMethod]
        public async Task PostCalculateDistance_WithTwoIdenticalPoints_ReturnsZeroDistance()
        {
            // Arrange
            var request = new CalculateDistanceRequest
            {
                Vertices = new[]
                {
                    new LatLngDto { Latitude = 40.7128, Longitude = -74.006 },
                    new LatLngDto { Latitude = 40.7128, Longitude = -74.006 },
                }
            };

            // Act
            var response = await Client.PostAsJsonAsync("api/geometry/calculate-distance", request);
            var content = await response.Content.ReadAsAsync<CalculateDistanceResponse>();

            // Assert
            Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);
            Assert.IsNotNull(content);
            Assert.AreEqual(0, content.TotalDistanceMeters, 1); // 1m tolerance
        }

        [TestMethod]
        public async Task PostCalculateDistance_WithRoundTrip_DistanceSymmetry()
        {
            // Arrange - Calculate NYC to LA
            var requestOneWay = new CalculateDistanceRequest
            {
                Vertices = new[]
                {
                    new LatLngDto { Latitude = 40.7128, Longitude = -74.006 }, // NYC
                    new LatLngDto { Latitude = 34.0522, Longitude = -118.2437 }, // LA
                }
            };

            // Arrange - Calculate NYC to LA to NYC
            var requestRoundTrip = new CalculateDistanceRequest
            {
                Vertices = new[]
                {
                    new LatLngDto { Latitude = 40.7128, Longitude = -74.006 }, // NYC
                    new LatLngDto { Latitude = 34.0522, Longitude = -118.2437 }, // LA
                    new LatLngDto { Latitude = 40.7128, Longitude = -74.006 }, // back to NYC
                }
            };

            // Act
            var responseOneWay = await Client.PostAsJsonAsync("api/geometry/calculate-distance", requestOneWay);
            var contentOneWay = await responseOneWay.Content.ReadAsAsync<CalculateDistanceResponse>();

            var responseRoundTrip = await Client.PostAsJsonAsync("api/geometry/calculate-distance", requestRoundTrip);
            var contentRoundTrip = await responseRoundTrip.Content.ReadAsAsync<CalculateDistanceResponse>();

            // Assert
            Assert.AreEqual(HttpStatusCode.OK, responseOneWay.StatusCode);
            Assert.AreEqual(HttpStatusCode.OK, responseRoundTrip.StatusCode);
            
            // Round trip should be approximately 2x the one way (within 100m tolerance)
            var expectedRoundTrip = 2 * contentOneWay.TotalDistanceMeters;
            Assert.IsTrue(Math.Abs(contentRoundTrip.TotalDistanceMeters - expectedRoundTrip) < 100);
        }
    }
}
