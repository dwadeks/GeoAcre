using Microsoft.VisualStudio.TestTools.UnitTesting;
using FluentAssertions;
using System.Collections.Generic;
using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;

namespace SteelTree.GeoAcre.Web.Api.Tests
{
    [TestClass]
    public class GeometryControllerTests
    {
        private HttpClient _httpClient = null!;
        private const string BaseUrl = "http://localhost:5000/api";

        [TestInitialize]
        public void Setup()
        {
            _httpClient = new HttpClient();
        }

        [TestCleanup]
        public void Cleanup()
        {
            _httpClient?.Dispose();
        }

        /// <summary>
        /// Test: POST /geometry/calculate-area with valid polygon returns correct area
        /// </summary>
        [TestMethod]
        public async Task CalculateArea_WithValidPolygon_ReturnsCorrectArea()
        {
            // Arrange
            var request = new
            {
                vertices = new[]
                {
                    new { latitude = 0.0, longitude = 0.0 },
                    new { latitude = 0.0, longitude = 1.0 },
                    new { latitude = 1.0, longitude = 0.0 }
                },
                excludePolygons = (object[]?)null
            };

            // Act
            var response = await _httpClient.PostAsJsonAsync(
                $"{BaseUrl}/geometry/calculate-area",
                request
            );

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var result = await response.Content.ReadAsAsync<dynamic>();
            result.Should().NotBeNull();
            dynamic resultData = result;
            resultData.areaSquareMeters.Should().BeGreaterThan(0);
            resultData.perSideLengthsMeters.Should().NotBeNull();
        }

        /// <summary>
        /// Test: POST /geometry/calculate-area with invalid polygon (< 3 vertices) returns 400
        /// </summary>
        [TestMethod]
        public async Task CalculateArea_WithInvalidPolygon_ReturnsBadRequest()
        {
            // Arrange
            var request = new
            {
                vertices = new[]
                {
                    new { latitude = 0.0, longitude = 0.0 },
                    new { latitude = 1.0, longitude = 1.0 }
                },
                excludePolygons = (object[]?)null
            };

            // Act
            var response = await _httpClient.PostAsJsonAsync(
                $"{BaseUrl}/geometry/calculate-area",
                request
            );

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        }

        /// <summary>
        /// Test: POST /geometry/calculate-area with exclude polygons returns net area
        /// </summary>
        [TestMethod]
        public async Task CalculateArea_WithExcludePolygons_ReturnsNetArea()
        {
            // Arrange
            var request = new
            {
                vertices = new[]
                {
                    new { latitude = 0.0, longitude = 0.0 },
                    new { latitude = 0.0, longitude = 2.0 },
                    new { latitude = 2.0, longitude = 0.0 }
                },
                excludePolygons = new[]
                {
                    new[]
                    {
                        new { latitude = 0.1, longitude = 0.1 },
                        new { latitude = 0.1, longitude = 0.2 },
                        new { latitude = 0.2, longitude = 0.1 }
                    }
                }
            };

            // Act
            var response = await _httpClient.PostAsJsonAsync(
                $"{BaseUrl}/geometry/calculate-area",
                request
            );

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var result = await response.Content.ReadAsAsync<dynamic>();
            result.Should().NotBeNull();
            dynamic resultData = result;
            resultData.netAreaSquareMeters.Should().BeGreaterThan(0);
            resultData.excludedAreaSquareMeters.Should().BeGreaterThan(0);
        }

        /// <summary>
        /// Test: Verify endpoint handles empty vertices array
        /// </summary>
        [TestMethod]
        public async Task CalculateArea_WithEmptyVertices_ReturnsBadRequest()
        {
            // Arrange
            var request = new
            {
                vertices = new object[0],
                excludePolygons = (object[]?)null
            };

            // Act
            var response = await _httpClient.PostAsJsonAsync(
                $"{BaseUrl}/geometry/calculate-area",
                request
            );

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        }
    }
}
