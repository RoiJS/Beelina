using Xunit;
namespace Beelina.UnitTest;

public class UnitTest1
{
    [Theory]
    [InlineData(1, 2, 3)]
    public void Test1(int num1, int num2, int expectedResult)
    {
        // Arrange
        var varNum1 = num1;
        var varNum2 = num2;

        // Act
        var result = varNum1 + varNum2;

        // Assert
        Assert.Equal(result, expectedResult);
    }

    [Theory]
    [InlineData(2, 1, 1)]
    public void Test2(int num1, int num2, int expectedResult)
    {
        // Arrange
        var varNum1 = num1;
        var varNum2 = num2;

        // Act
        var result = varNum1 - varNum2;

        // Assert
        Assert.Equal(result, expectedResult);
    }

    [Theory]
    [InlineData(2, 1, 2)]
    public void Test3(int num1, int num2, int expectedResult)
    {
        // Arrange
        var varNum1 = num1;
        var varNum2 = num2;

        // Act
        var result = varNum1 * varNum2;

        // Assert
        Assert.Equal(result, expectedResult);
    }

    [Theory]
    [InlineData(2, 1, 2)]
    public void Test4(int num1, int num2, int expectedResult)
    {
        // Arrange
        var varNum1 = num1;
        var varNum2 = num2;

        // Act
        var result = varNum1 / varNum2;

        // Assert
        Assert.Equal(result, expectedResult);
    }
}